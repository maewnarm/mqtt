import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react'
import Paho from 'paho-mqtt'

const client = new Paho.Client("broker.emqx.io", Number(8083), "asdas")

function App() {
  const [data, setData] = useState({})
  const topics = ["mc1/status", 'mc2/status']

  client.onConnectionLost = function (responseObject) {
    console.log("Connection Lost: " + responseObject.errorMessage)
  }
  client.onMessageArrived = function (message) {
    console.log(data)
    console.log("Message Arrived: " + message.payloadString)
    setData({ ...data, [message.destinationName]: message.payloadString })
  }
  function onConnect() {
    console.log("Connected")
  }
  useEffect(() => {
    client.connect({
      onSuccess: onConnect
    })
    console.log("render")
  }, [])

  const publish = async (pubTopic) => {
    // const pubTopic = document.getElementById('topic_pub').value
    const elID = `msg-${pubTopic}`
    const message = new Paho.Message(document.getElementById(elID).value)
    message.destinationName = pubTopic
    message.qos = 0
    message.retained = false
    client.send(message)
    console.log("publish: " + pubTopic + ", msg: " + message)
  }

  const subscribe = (subTopic) => {
    // const subTopic = document.getElementById('topic_sub').value
    client.subscribe(subTopic)
    console.log("subscribe: " + subTopic)
  }

  const getCurrentData = () => {
    console.log(data)
  }

  return (
    <div className="App">
      <header className="App-header">
        <script src="/paho-1.0.3/paho-mqtt-min.js"></script>
        <script src="/paho-1.0.3/paho-mqtt.js"></script>
        <script src="mqttws31.js">
        </script>
        <button onClick={getCurrentData}>Current Data</button>
        <table>
          <thead>
            <tr>
              <th>topic</th>
              <th>subscribe</th>
              <th>publish</th>
              <th>msg</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic, ind) =>
              <tr key={ind}>
                <td>{topic}</td>
                <td>
                  <button onClick={() => subscribe(topic)}>Sub</button>
                </td>
                <td>
                  <input id={`msg-${topic}`}/>
                  <button onClick={() => publish(topic)}>Pub</button>
                </td>
                <td>{data[topic] || 'empty'}</td>
              </tr>
            )}
          </tbody>
        </table>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
