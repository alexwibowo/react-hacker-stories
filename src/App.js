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


// Main application
const App = () => {
  const initialStories = [
    {
      title: "React",
      url: "https://reactjs.org/",
      author: "Jordan Walke",
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: "Redux",
      url: "https://redux.js.org/",
      author: "Dan Abramov, Andrew Clark",
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];

  const getAsyncStories = () =>  
    new Promise(resolve => {
        setTimeout(
          () => resolve({ data: {stories: initialStories} }), 
          2000
        );
    });
  

  // we use semi persistent storage to remember what use has searched
  const [searchTerm, setSearchTerm] = useSemiPersistentStorage(
    "search",
    "React"
  );
  const [stories, setStories] = React.useState([]);

  React.useEffect(function(){
    getAsyncStories().then(function(result) {
      setStories(result.data.stories)
    });
  }, []);

  const handleChangeSearchTerm = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRemoveStory = (item) => {
    const newStories = stories.filter(
      (story) => story.objectID !== item.objectID
    );
    setStories(newStories);
  };

  // this is interesting.. React knows that there is a dependency between 'searchedStories' and 'searchTerm'.
  // i.e. when searchTerm changed, this snippet is re-evaluated ?
  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Hello {title}</h1>

      <Search onSearch={handleChangeSearchTerm} searchTerm={searchTerm} />
      <hr />
      <List list={searchedStories} onRemoveItem={handleRemoveStory} />
    </div>
  );
};

export default App;
