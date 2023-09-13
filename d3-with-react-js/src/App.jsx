import * as d3 from 'd3'
import React, { useEffect, useRef, useState } from 'react'
import Histogram from './Histogram'
import ScatterPlot from './ScatterPlot'
import Timeline from './Timeline'
import { getScatterData, getTimelineData } from './utils/dummyData'
// import Histogram from './completed/Histogram'
// import ScatterPlot from './completed/ScatterPlot'
// import Timeline from './completed/Timeline'
import './styles.css'

const parseDate = d3.timeParse('%m/%d/%Y')
const dateAccessor = (d) => parseDate(d.date)
const temperatureAccessor = (d) => d.temperature
const humidityAccessor = (d) => d.humidity

const getData = () => ({
  timeline: getTimelineData(),
  scatter: getScatterData(),
})
export default function App() {
  const [data, setData] = useState(getData())

  useInterval(() => {
    setData(getData())
  }, 4000)

  return (
    <div className="App">
      <h1>Weather Dashboard</h1>

      <div className="App__charts">
        <Timeline
          data={data.timeline}
          xAccessor={dateAccessor}
          yAccessor={temperatureAccessor}
          label="Temperature"
        />
        <ScatterPlot
          data={data.scatter}
          xAccessor={humidityAccessor}
          yAccessor={temperatureAccessor}
          xLabel="Humidity"
          yLabel="Temperature"
        />
        <Histogram data={data.scatter} xAccessor={humidityAccessor} label="Humidity" />
      </div>
    </div>
  )
}

function useInterval(callback, delay) {
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  })

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}
