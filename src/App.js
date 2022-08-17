import logo from './logo.svg';
import './App.css';
import React from 'react';
import axios from 'axios';

const title="React";

const List = ({ list, onRemoveItem }) =>
  list.map((item) => (
    <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
  ));

const Item = ({ item, onRemoveItem }) => (
  <div>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
    <span>
      {/* See how we are using inline handlers here. This is because we want to pass 'item' to the onRemoveItem method */}
      <button
        type="button"
        onClick={() => {
          onRemoveItem(item);
        }}
      >
        Dismiss
      </button>
    </span>
  </div>
);

const InputWithLabel = ({
  id,
  type = "text",
  value,
  isFocused,
  onInputChange,
  children,
}) => {
  const inputRef = React.useRef();

  // here we are using imperative way to focus on a particular DOM. We are using React's useRef for this.
  React.useEffect(
    function () {
      if (isFocused && inputRef.current) {
        inputRef.current.focus();
      }
    },
    [isFocused]
  );

  return (
    <>
      <label htmlFor={id}>{children}</label>
      <input
        id={id}
        type={type}
        ref={inputRef}
        onChange={onInputChange}
        value={value}
      />
    </>
  );
};

const Search = ({onSearchChange, searchTerm, onSubmit}) => {
  return (
      <>
        <InputWithLabel id="search"
          value={searchTerm}
          isFocused
          onInputChange={onSearchChange}>
          Search :
        </InputWithLabel>

        <p>
          Searching for <strong>{searchTerm}</strong>.
        </p>
          <button type="button"  onClick={onSubmit}>Submit</button>
      </>
  );
};

// custom hook. Look at how the return value follows the React convention for useState - first element array is state value, and the second element array is a setter
const useSemiPersistentStorage = (key, initialState) => {

  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  // Since the key comes from outside, the custom hook assumes that it could change, so it needs to be included in the dependency array of the useEffect hook. Without it, the side-effect may run with an outdated key (also called stale) if the key changed between renders.
  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key])

  return [value, setValue];
};

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

// Main application
const App = () => {

  // we use semi persistent storage to remember what use has searched
  const [searchTerm, setSearchTerm] = useSemiPersistentStorage(
    "search",
    "React"
  );

    const [url, setUrl] = React.useState(
        `${API_ENDPOINT}${searchTerm}`
    );


    // reducer function, receive two parameters - current state, and the action
  // This will be the central place where we do our state management logic (based on the action type)
  // For every state transition, we return a new state object which contains all the key/value pairs from the current state object (via JavaScript’s spread operator) and the new overwriting properties. For example, STORIES_FETCH_FAILURE resets the isLoading, but sets the isError boolean flags yet keeps all the other state intact (e.g. stories). That’s how we get around the bug introduced earlier, since an error should remove the loading state.
  const storiesReducer = function(state, action){
    switch (action.type){
      case "STORIES_FETCH_INIT":
        return {
            ...state,
            isLoading: true,
            isError: false
        };
      case "STORIES_FETCH_SUCCESS":
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          isError: false
        };
      case "REMOVE_STORY":
        return {
          ...state,
          data:  state.data.filter(
            (story) => story.objectID !== action.payload.objectID
          )
        };
      case "STORIES_FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true
      };
      default:
        throw new Error()
    }
  };

  // first parameter is the reducer function, and second parameter is the initial state 
  // the value returned is the 'current state' that we can bind as usual, and the second 
  // is the state updater function (dispatch function)
  // Instead of doing set* when we use useState, we dispatch action to the reducer function.
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false
  });

   // here we are extracting out the search function so that we can use it elsewhere if we need to
    // Our 'handleFetchStories' depends on 'url', but we dont want the function to be recreated
    // on every refresh. Hence we memoize it here using 'useCallback'.
    // This useCallback creates a memoized function every time its dependency array ([url]) changes.
    // Because url changes, handleFetchStories gets recreated. Because handleFetchStories gets recreated,
    // React.useEffect that depends on handleFetchStories function gets called.
    // without 'useCallback', we will run into endless loop:
    // 1. we define handleFetchStories
    // 2. side-effect, so React.useEffect(...,[handleFetchStories]) runs
    // 3. because it runs, we update the state, which re-render component
    // 4. because of re-rendering, handleFetchStories gets recreated... etc
    //
    // using useCallback, a new function will only get recreated if the dependency change.

    // To use async/await, our function requires the async keyword. Once you start using the await keyword,
    // everything reads like synchronous code. Actions after the await keyword are not executed until promise resolves,
    // meaning the code will wait.
  const handleFetchStories = React.useCallback(async () => {
      // send an action that indicates we are fetching something
      dispatchStories({type: "STORIES_FETCH_INIT"});

      try {
          const result = await axios.get(url);
          dispatchStories({
              type: 'STORIES_FETCH_SUCCESS',
              payload: result.data.hits
          });
      } catch  {
          dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
      }

      // alternatively, use browser's native fetch to get
      /* axios.get(url)
             .then(result => {
                 dispatchStories({
                     type: 'STORIES_FETCH_SUCCESS',
                     payload: result.data.hits
                 });
             })
             .catch(() => {
                 dispatchStories({type: "STORIES_FETCH_FAILURE"});
             });*/
  },[url]);


  React.useEffect(function(){
      // dont perform search if it is empty
      handleFetchStories()
  }, [handleFetchStories]);

  const handleChangeSearchTerm = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRemoveStory = (item) => {

    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item
    });
  };

  const handleSearchSubmit = () => {
      setUrl(`${API_ENDPOINT}${searchTerm}`);
  };

  return (
    <div>
      <h1>Hello {title}</h1>

      <Search onSearchChange={handleChangeSearchTerm} searchTerm={searchTerm} onSubmit={handleSearchSubmit} />
      <hr />

      { /* In JavaScript, a true && 'Hello World' always evaluates to ‘Hello World’. A false && 'Hello World' always evaluates to false. In React, we can use this behaviour to our advantage. If the condition is true, the expression after the logical && operator will be the output. If the condition is false, React ignores it and skips the expression. */}
      { stories.isError && <p>Some terrible stuff has happened</p> }
      {
        stories.isLoading? (
          <p>Loading...</p>
        ) : (
          <List list={stories.data} onRemoveItem={handleRemoveStory} />
        )
      }
    </div>
  );
};

export default App;
