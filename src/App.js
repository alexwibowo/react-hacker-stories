import logo from './logo.svg';
import './App.css';
import React from 'react';

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

const Search = ({onSearch, searchTerm}) => {
  return (
      <>
        <InputWithLabel id="search"
          value={searchTerm}
          isFocused
          onInputChange={onSearch}>
          Search :
        </InputWithLabel>

        <p>
          Searching for <strong>{searchTerm}</strong>.
        </p>
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


  React.useEffect(function(){
      // dont perform search if it is empty
      if (searchTerm === "") return;

    // send an action that indicates we are fetching something
    dispatchStories({type: "STORIES_FETCH_INIT"});

    // 1. use javascript Template Literal for string interpolation
      // 2. use browser's native fetch to get
    fetch(`${API_ENDPOINT}${searchTerm}`)
        .then(response => response.json())
        .then(result => {
          dispatchStories({
            type: 'STORIES_FETCH_SUCCESS',
            payload: result.hits
          });
        })
        .catch(() => {
          dispatchStories({type: "STORIES_FETCH_FAILURE"});
        });

  }, [searchTerm]);

  const handleChangeSearchTerm = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRemoveStory = (item) => {

    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item
    });
  };

  return (
    <div>
      <h1>Hello {title}</h1>

      <Search onSearch={handleChangeSearchTerm} searchTerm={searchTerm} />
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
