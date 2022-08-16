import logo from './logo.svg';
import './App.css';
import React from 'react';

const title="React";




const List = (props) => 
  props.list.map( ({objectID, ...item}) => 
    <Item key={objectID} {...item}/>
  );

const Item = ({
        url,
        title,
        author,
        num_comments,
        points
    }) => (
    <div>
      <span>
        <a href={url}>{title}</a>
      </span>
      <span>{author}</span>
      <span>{num_comments}</span>
      <span>{points}</span>
    </div>
);


const Search = ({onSearch, searchTerm}) => {
  return (
      <>
        <label htmlFor='search'>Search: </label>
        <input id="search" type="text" onChange={onSearch}
          value={searchTerm}/>
        
        <p>
          Searching for <strong>{searchTerm}</strong>.
        </p>
      </>
  );

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

  const [searchTerm, setSearchTerm] = React.useState('React');

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
