import * as d3 from 'd3'

async function drawLineChart() {
  // 1. Access data
  let dataset = await d3.json('data/my_weather_data.json')

  // 2. Create chart dimensions

  const yAccessor = (d) => d.temperatureMax
  const dateParser = d3.timeParse('%Y-%m-%d')
  const xAccessor = (d) => dateParser(d.date)
  dataset = dataset.sort((a, b) => xAccessor(a) - xAccessor(b)).slice(0, 100)

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  // 3. Draw canvas

  const wrapper = d3
    .select('#wrapper')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)

  const bounds = wrapper
    .append('g')
    .style('transform', `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  // init static elements
  bounds
    .append('defs')
    .append('clipPath')
    .attr('id', 'bounds-clip-path')
    .append('rect')
    .attr('width', dimensions.boundedWidth)
    .attr('height', dimensions.boundedHeight)
  bounds.append('rect').attr('class', 'freezing')

  const clip = bounds.append('g').attr('clip-path', 'url(#bounds-clip-path)')

  bounds.append('path').attr('class', 'line')
  bounds
    .append('g')
    .attr('class', 'x-axis')
    .style('transform', `translateY(${dimensions.boundedHeight}px)`)
  bounds.append('g').attr('class', 'y-axis')

  const drawLine = (dataset) => {
    // 4. Create scales
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, yAccessor))
      .range([dimensions.boundedHeight, 0])

    const freezingTemperaturePlacement = yScale(32)
    const freezingTemperatures = bounds
      .select('.freezing')
      .attr('x', 0)
      .attr('width', dimensions.boundedWidth)
      .attr('y', freezingTemperaturePlacement)
      .attr('height', dimensions.boundedHeight - freezingTemperaturePlacement)

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataset, xAccessor))
      .range([0, dimensions.boundedWidth])

    const lastTwoPoints = dataset.slice(-2)
    const pixelsBetweenLastPoints =
      xScale(xAccessor(lastTwoPoints[1])) - xScale(xAccessor(lastTwoPoints[0]))

    // 5. Draw data
    const lineGenerator = d3
      .line()
      .x((d) => xScale(xAccessor(d)))
      .y((d) => yScale(yAccessor(d)))

    const line = bounds
      .select('.line')
      .attr('d', lineGenerator(dataset))
      .style('transform', `translateX(${pixelsBetweenLastPoints}px)`)
      .transition()
      .duration(1000)
      .style('transform', 'none')

    // 6. Draw peripherals
    const yAxisGenerator = d3.axisLeft().scale(yScale)

    const yAxis = bounds.select('.y-axis').call(yAxisGenerator)

    const xAxisGenerator = d3.axisBottom().scale(xScale)

    const xAxis = bounds.select('.x-axis').transition().duration(1000).call(xAxisGenerator)

    const listeingRect = bounds
      .append('rect')
      .attr('class', 'listening-rect')
      .attr('width', dimensions.boundedWidth)
      .attr('height', dimensions.boundedHeight)
      .on('mousemove', onMouseMove)
      .on('mouseleave', onMouseLeave)

    const tooltip = d3.select('#tooltip')

    function onMouseMove(e) {
      const mousePosition = d3.pointer(e)
      const hoveredDate = xScale.invert(mousePosition[0])

      const getDistanceFromHoveredDate = (d) => Math.abs(xAccessor(d) - hoveredDate)
      const closestIndex = d3.leastIndex(
        dataset,
        (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b),
      )
      const closestDataPoint = dataset[closestIndex]
      const closestXValue = xAccessor(closestDataPoint)
      const closestYValue = yAccessor(closestDataPoint)
      const formatTemperature = (d) => `${d3.format('.1f')(d)}°F`
      tooltip.select('#temperature').html(formatTemperature(closestYValue))

      const x = xScale(closestXValue) + dimensions.margin.left
      const y = yScale(closestYValue) + dimensions.margin.top

      tooltip.style(
        'transform',
        `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`,
      )

      tooltip.style('opacity', 1)
    }

    function onMouseLeave() {
      tooltip.style('opacity', 0)
    }
  }
  drawLine(dataset)

  // update the line every 1.5 seconds
  setInterval(addNewDay, 1500)

  function addNewDay() {
    dataset = [...dataset.slice(1), generateNewDataPoint(dataset)]
    drawLine(dataset)
  }

  function generateNewDataPoint(dataset) {
    const lastDataPoint = dataset[dataset.length - 1]
    const nextDay = d3.timeDay.offset(xAccessor(lastDataPoint), 1)

    return {
      date: d3.timeFormat('%Y-%m-%d')(nextDay),
      temperatureMax: yAccessor(lastDataPoint) + (Math.random() * 6 - 3),
    }
  }
}
drawLineChart()
