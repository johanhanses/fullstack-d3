import * as d3 from 'd3'

async function drawBars() {
  const dataset = await d3.json('data/my_weather_data.json')
  console.log(dataset)

  const width = 600

  let dimensions = {
    width: width,
    height: width * 0.6,
    margin: {
      top: 30,
      right: 10,
      bottom: 50,
      left: 50,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  const drawHistogram = (metric) => {
    const metricAccessor = (d) => d[metric]
    const yAccessor = (d) => d.length

    const wrapper = d3
      .select('#app')
      .append('svg')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)

    wrapper.attr('role', 'figure').attr('tabindex', '0')
    wrapper.append('title').text('Histogram looking at the distribution of humidity in 2016')

    const bound = wrapper
      .append('g')
      .style('transform', `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, metricAccessor))
      .range([0, dimensions.boundedWidth])
      .nice()

    const binsGenerator = d3.bin().domain(xScale.domain()).value(metricAccessor).thresholds(12)
    const bins = binsGenerator(dataset)

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(bins, yAccessor)])
      .range([dimensions.boundedHeight, 0])
      .nice()

    const binsGroup = bound
      .append('g')
      .attr('tabindex', '0')
      .attr('role', 'list')
      .attr('aria-label', 'histogram bars')

    const binGroups = binsGroup
      .selectAll('g')
      .data(bins)
      .join('g')
      .attr('tabindex', '0')
      .attr('role', 'listitem')
      .attr(
        'aria-label',
        (d) =>
          `There were ${yAccessor(d)} days between ${d.x0.toString().slice(0, 4)} and ${d.x1
            .toString()
            .slice(0, 4)} humidity levels.`,
      )

    const barPadding = 1

    const barRects = binGroups
      .append('rect')
      .attr('x', (d) => xScale(d.x0) + barPadding / 2)
      .attr('y', (d) => yScale(yAccessor(d)))
      .attr('width', (d) => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))
      .attr('height', (d) => dimensions.boundedHeight - yScale(yAccessor(d)))
      .attr('fill', 'cornflowerblue')

    const barText = binGroups
      .filter(yAccessor)
      .append('text')
      .attr('x', (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .attr('y', (d) => yScale(yAccessor(d)) - 5)
      .text(yAccessor)
      .style('text-anchor', 'middle')
      .attr('fill', 'darkgrey')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')

    const mean = d3.mean(dataset, metricAccessor)

    bound
      .append('line')
      .attr('x1', xScale(mean))
      .attr('x2', xScale(mean))
      .attr('y1', -15)
      .attr('y2', dimensions.boundedHeight)
      .attr('stroke', 'maroon')
      .attr('stroke-dasharray', '2px 4px')

    bound
      .append('text')
      .attr('x', xScale(mean))
      .attr('y', -20)
      .text('mean')
      .attr('fill', 'maroon')
      .style('font-size', '12px')
      .style('text-anchor', 'middle')

    const xAxisGenerator = d3.axisBottom().scale(xScale)

    const xAxis = bound
      .append('g')
      .call(xAxisGenerator)
      .style('transform', `translateY(${dimensions.boundedHeight}px)`)

    xAxis
      .append('text')
      .attr('x', dimensions.boundedWidth / 2)
      .attr('y', dimensions.margin.bottom - 10)
      .attr('fill', 'black')
      .style('font-size', '1.4em')
      .text(metric)
      .style('text-transform', 'capitalize')

    wrapper.selectAll('text').attr('role', 'presentation').attr('aria-hidden', 'true')
  }

  const metrics = [
    'windSpeed',
    'moonPhase',
    'dewPoint',
    'humidity',
    'uvIndex',
    'windBearing',
    'temperatureMin',
    'temperatureMax',
  ]

  metrics.forEach(drawHistogram)
}

drawBars()
