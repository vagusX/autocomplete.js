const htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const unescapedHtml = /[&<>"']/g;
const hasUnescapedHtml = RegExp(unescapedHtml.source);

function escape(value: string): string {
  return value && hasUnescapedHtml.test(value)
    ? value.replace(unescapedHtml, char => htmlEscapes[char])
    : value;
}

export function parseHighlightedAttribute({
  highlightPreTag,
  highlightPostTag,
  highlightedValue,
}) {
  const splitByPreTag = highlightedValue.split(highlightPreTag);
  const firstValue = splitByPreTag.shift();
  const elements =
    firstValue === '' ? [] : [{ value: firstValue, isHighlighted: false }];

  if (highlightPostTag === highlightPreTag) {
    let isHighlighted = true;

    splitByPreTag.forEach(split => {
      elements.push({ value: split, isHighlighted });
      isHighlighted = !isHighlighted;
    });
  } else {
    splitByPreTag.forEach(split => {
      const splitByPostTag = split.split(highlightPostTag);

      elements.push({
        value: splitByPostTag[0],
        isHighlighted: true,
      });

      if (splitByPostTag[1] !== '') {
        elements.push({
          value: splitByPostTag[1],
          isHighlighted: false,
        });
      }
    });
  }

  return elements;
}

function getPropertyByPath(object: object, path: string): any {
  const parts = path.split('.');

  return parts.reduce((current, key) => current && current[key], object);
}

export function highlightAlgoliaHit({
  hit,
  attribute,
  highlightPreTag = '<em>',
  highlightPostTag = '</em>',
}): string {
  const highlightedValue =
    (getPropertyByPath(hit, `_highlightResult.${attribute}.value`) as string) ||
    '';

  return parseHighlightedAttribute({
    highlightPreTag,
    highlightPostTag,
    highlightedValue,
  })
    .map(part => {
      const escapedValue = escape(part.value);

      return part.isHighlighted
        ? `${highlightPreTag}${escapedValue}${highlightPostTag}`
        : escapedValue;
    })
    .join('');
}

export function reverseHighlightAlgoliaHit({
  hit,
  attribute,
  highlightPreTag = '<em>',
  highlightPostTag = '</em>',
}): string {
  const highlightedValue =
    (getPropertyByPath(hit, `_highlightResult.${attribute}.value`) as string) ||
    '';
  const parsedHighlightedAttribute = parseHighlightedAttribute({
    highlightPreTag,
    highlightPostTag,
    highlightedValue,
  });
  const noPartsMatch = !parsedHighlightedAttribute.some(
    part => part.isHighlighted
  );

  return parsedHighlightedAttribute
    .map(part => {
      const escapedValue = escape(part.value);

      // We don't want to highlight the whole word when no parts match.
      if (noPartsMatch) {
        return escapedValue;
      }

      return part.isHighlighted
        ? escapedValue
        : `${highlightPreTag}${escapedValue}${highlightPostTag}`;
    })
    .join('');
}
