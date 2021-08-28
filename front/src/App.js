import React, { useState } from 'react';
import Counter from './components/Counter';
import "./styles/App.css";
import Post from './components/post';
import my_Table from './components/my_table';
import Stupid_func from './components/stupid_func';

function App() {
  
  const [value, setValue] = useState('hiheeo')
  const [posts, setPosts] = useState([
    {id : 1, title: 'prop1s', body: 'body here'},
    {id : 2, title: 'prop2s', body: 'body here'},
    {id : 3, title: 'prop3s', body: 'body here'}
  ])


  return (
    <div className="App">
    
     <Stupid_func/>
     
    </div>
    
  );
}

export default App;
