import * as d3 from 'd3'

async function drawLineChart() {
  const data = await d3.json('./data/my_weather_data.json')

  const yAccessor = (d) => d.temperatureMax
  const xAccessor = (d) => d3.timeParse('%Y-%m-%d')(d.date)

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margins: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margins.left - dimensions.margins.right
  dimensions.boundedHeight = dimensions.height - dimensions.margins.top - dimensions.margins.bottom

  const wrapper = d3
    .select('#app')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)

  const bounds = wrapper
    .append('g')
    .style('transform', `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`)

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, yAccessor))
    .range([dimensions.boundedHeight, 0])

  const freezingTemperaturePlacement = yScale(32)
  const freezingTemperatures = bounds
    .append('rect')
    .attr('x', 0)
    .attr('width', dimensions.boundedWidth)
    .attr('y', freezingTemperaturePlacement)
    .attr('height', dimensions.boundedHeight - freezingTemperaturePlacement)
    .attr('fill', '#e0f3f3')

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, xAccessor))
    .range([0, dimensions.boundedWidth])

  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)))

  // draw the line
  bounds
    .append('path')
    .attr('d', lineGenerator(data))
    .attr('fill', 'none')
    .attr('stroke', '#af9358')
    .attr('stroke-width', 2)

  const yAxisGenerator = d3.axisLeft().scale(yScale)
  const xAxisGenerator = d3.axisBottom().scale(xScale)
  // draw the axis
  bounds.append('g').call(yAxisGenerator)
  bounds
    .append('g')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`)
}
drawLineChart()
