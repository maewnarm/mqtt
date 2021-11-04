import logo from './logo.svg';
import './App.css';
import { useState, useEffect, useCallback } from 'react'
import Paho from 'paho-mqtt'
import { ResponsiveLine } from '@nivo/line'

const host = "broker.emqx.io"
const port = 8084
var client = new Paho.Client(host, Number(port), "asdas")
const graphData = [
  {
    "id": "japan",
    "data": [
      {
        "x": "plane",
        "y": 129
      },
      {
        "x": "helicopter",
        "y": 256
      },
      {
        "x": "boat",
        "y": 193
      },
      {
        "x": "train",
        "y": 202
      },
      {
        "x": "subway",
        "y": 129
      },
      {
        "x": "bus",
        "y": 199
      },
      {
        "x": "car",
        "y": 109
      },
      {
        "x": "moto",
        "y": 181
      },
      {
        "x": "bicycle",
        "y": 242
      },
      {
        "x": "horse",
        "y": 253
      },
      {
        "x": "skateboard",
        "y": 32
      },
      {
        "x": "others",
        "y": 253
      }
    ]
  },
  {
    "id": "france",
    "color": "hsl(49, 70%, 50%)",
    "data": [
      {
        "x": "plane",
        "y": 28
      },
      {
        "x": "helicopter",
        "y": 174
      },
      {
        "x": "boat",
        "y": 87
      },
      {
        "x": "train",
        "y": 4
      },
      {
        "x": "subway",
        "y": 133
      },
      {
        "x": "bus",
        "y": 268
      },
      {
        "x": "car",
        "y": 5
      },
      {
        "x": "moto",
        "y": 54
      },
      {
        "x": "bicycle",
        "y": 69
      },
      {
        "x": "horse",
        "y": 256
      },
      {
        "x": "skateboard",
        "y": 201
      },
      {
        "x": "others",
        "y": 70
      }
    ]
  }
]

const topics = [
  'dnth/energy/1',
  'dnth/energy/2',
  'dnth/energy/5'
]
var chartData = {}
topics.forEach((topic) => {
  chartData = { ...chartData, [topic]: { id: topic, data: [] } }
})

function App() {
  const [data, setData] = useState({})
  const [connection, setConnection] = useState("Disconnect")
  const [subStatus, setSubStatus] = useState({})
  const [chartUseData, setChartUseData] = useState([])

  client.onConnectionLost = function (responseObject) {
    console.log("Connection lost: " + responseObject.errorMessage)
    setConnection("Connection is lost")
  }

  client.onMessageArrived = function (message) {
    // console.log(data)
    // console.log("Message Arrived: " + message.payloadString)
    const topic = message.destinationName
    chartData[topic].data.push({ x: chartData[topic].data.length + 1, y: message.payloadString })
    // console.log(chartData)
    setData({ ...data, [topic]: message.payloadString })
    const useData = Object.keys(chartData).map((key) => chartData[key])
    console.log(useData)
    setChartUseData(useData)
  }

  function onConnect() {
    // console.log("Connected")
    setConnection("Connected")
  }

  const connectMQTT = useCallback(() => {
    client = new Paho.Client(host, Number(port), "asdas")
    client.connect({
      onSuccess: onConnect,
      useSSL: true,
    })
  }, [])

  useEffect(() => {
    connectMQTT()
    // console.log("render")
  }, [connectMQTT])

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
    setSubStatus({ ...subStatus, [subTopic]: true })
    console.log("subscribe: " + subTopic)
  }

  const unsubscribe = (subTopic) => {
    client.unsubscribe(subTopic)
    setSubStatus({ ...subStatus, [subTopic]: false })
    console.log("unsubscribe: " + subTopic)
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
        <img src={logo} className="App-logo" alt="logo" />
        <h2>Connection status: <u>{connection}</u></h2>
        <button onClick={connectMQTT} disabled={connection === "Connected"}>Connect</button>
        <button onClick={getCurrentData}>Current Data</button>
        <table>
          <thead>
            <tr>
              <th>topic</th>
              <th>subscribe</th>
              <th>unsubscribe</th>
              <th>publish</th>
              <th>msg</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic, ind) =>
              <tr key={ind}>
                <td>{topic}</td>
                <td>
                  <button onClick={() => subscribe(topic)} disabled={connection !== "Connected" || subStatus[topic]}>Sub</button>
                </td>
                <td>
                  <button onClick={() => unsubscribe(topic)} disabled={connection !== "Connected" || !subStatus[topic]}>Unsub</button>
                </td>
                <td>
                  <input id={`msg-${topic}`} />
                  <button onClick={() => publish(topic)} disabled={connection !== "Connected"}>Pub</button>
                </td>
                <td>{data[topic] || 'empty'}</td>
                <td
                  style={{ color: subStatus[topic] ? 'blue' : 'red' }}
                >
                  {subStatus[topic] ? 'Subscribing' : 'Unsubscribed'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </header>
      <div className="chart" >
        <ResponsiveLine
          data={chartUseData}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: 'linear', min: 1, max: 'auto', reverse: false }}
          yScale={{ type: 'linear', min: 0, max: 'auto', reverse: false }}
          yFormat=" >-.0f"
          xFormat=" >-.0f"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            // legend: 'transportation',
            // legendOffset: 36,
            // legendPosition: 'middle'
          }}
          axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Energy (W)',
            legendOffset: -40,
            legendPosition: 'middle'
          }}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
        />
      </div>
    </div>
  );
}

export default App;
