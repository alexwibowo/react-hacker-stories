import logo from './logo.svg';
import './App.css';
import React from 'react';

const title="React";

const List = (props) => 
  props.list.map( (item) => 
    <Item key={item.objectID} item={item}/>
  );

const Item = ({item}) => (
    <div>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
    </div>
);

const InputWithLabel = ({id, label, value, onInputChange}) => {
  return (
    <>
      <label htmlFor={id}>{label}: </label>
      <input id={id} type="text" onChange={onInputChange}
        value={value}/>     
    </>
  );
};

const Search = ({onSearch, searchTerm}) => {
  return (
      <>
        <InputWithLabel id="search"
        label="Search"
        value={searchTerm}
        onInputChange={onSearch}/>
        <p>
          Searching for <strong>{searchTerm}</strong>.
        </p>
      </>
  );
};

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


const App = () =>  {
  const stories = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
  }, {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
  } ];

  const [searchTerm, setSearchTerm] = useSemiPersistentStorage("search", "React");
  
  const handleChange = (event) => {
    setSearchTerm(event.target.value); 
  };

  const searchedStories = stories.filter((story) => 
      story.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Hello {title}</h1>

      <Search onSearch={handleChange} searchTerm={searchTerm}/>     
      <hr/>
      <List list={searchedStories}/>
    </div>
  );
}

export default App;
