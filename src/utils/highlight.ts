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
  highlightPreTag = '<mark>',
  highlightPostTag = '</mark>',
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
      return part.isHighlighted
        ? `${highlightPreTag}${part.value}${highlightPostTag}`
        : part.value;
    })
    .join('');
}

export function reverseHighlightAlgoliaHit({
  hit,
  attribute,
  highlightPreTag = '<mark>',
  highlightPostTag = '</mark>',
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
      return part.isHighlighted
        ? part.value
        : `${highlightPreTag}${part.value}${highlightPostTag}`;
    })
    .join('');
}
