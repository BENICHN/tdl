import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import init from './utils'

const root = document.getElementById('root')

root.addEventListener("load", (async () => {
    try {
      await init()
      ReactDOM.render(<App />, root) }
    catch (e) { alert('Could not start app : \n' + e) } })())