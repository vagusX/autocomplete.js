/* eslint-disable import/no-unresolved */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useHistory } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import { SearchButton } from 'docsearch-react';

let DocSearch = null;

let timerId;
const debouncePushHistoryState = state => {
  clearTimeout(timerId);

  if (state.query && state.isOpen) {
    timerId = setTimeout(() => {
      window.history.pushState(
        '',
        '',
        location.origin +
          location.pathname +
          location.hash +
          '?q=' +
          state.query
      );
    }, 400);
  }
};

function SearchBar() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const { siteConfig = {} } = useDocusaurusContext();
  const history = useHistory();

  const {
    indexName,
    appId,
    apiKey,
    searchParameters,
  } = siteConfig.themeConfig.algolia;

  const load = useCallback(
    function load() {
      if (isLoaded === true) {
        return Promise.resolve();
      }

      return Promise.all([
        import('docsearch-react'),
        import('docsearch-react/dist/esm/style.css'),
      ]).then(([{ DocSearch: DocSearchComp }]) => {
        DocSearch = DocSearchComp;
        setIsLoaded(true);
      });
    },
    [isLoaded, setIsLoaded]
  );

  const onOpen = useCallback(
    function onOpen() {
      load().then(() => {
        setIsShowing(true);
        document.body.classList.add('DocSearch--active');
      });
    },
    [load, setIsShowing]
  );

  const onClose = useCallback(
    function onClose() {
      setIsShowing(false);
      document.body.classList.remove('DocSearch--active');

      history.push({ search: '' });
    },
    [setIsShowing, history]
  );

  useEffect(() => {
    function onKeyDown(event) {
      if (
        (event.key === 'Escape' && isShowing) ||
        (event.key === 'k' && (event.metaKey || event.ctrlKey))
      ) {
        event.preventDefault();

        if (isShowing) {
          onClose();
        } else {
          onOpen();
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isShowing, onOpen, onClose]);

  if (isShowing === false) {
    if (new URL(window.location).searchParams.get('q')) {
      onOpen();
    }
  }

  return (
    <>
      <SearchButton onClick={onOpen} />

      {isLoaded &&
        isShowing &&
        createPortal(
          <DocSearch
            appId={appId}
            apiKey={apiKey}
            indexName={indexName}
            searchParameters={searchParameters}
            onClose={onClose}
            navigator={{
              navigate({ suggestionUrl }) {
                history.push({
                  pathname: suggestionUrl,
                  search: '',
                });
              },
            }}
            transformItems={items => {
              return items.map(item => {
                const url = new URL(item.url);

                return {
                  ...item,
                  url: item.url
                    .replace(url.origin, '')
                    .replace('#__docusaurus', ''),
                };
              });
            }}
            hitComponent={Hit}
            initialState={{
              query: new URL(window.location).searchParams.get('q'),
            }}
            onStateChange={({ state }) => {
              debouncePushHistoryState(state);
            }}
          />,
          document.body
        )}
    </>
  );
}

function Hit({ hit, children }) {
  return <Link to={hit.url}>{children}</Link>;
}

export default SearchBar;
