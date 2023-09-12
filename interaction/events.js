import * as d3 from 'd3'

async function createEvent() {
  const rectColors = ['yellowgreen', 'cornflowerblue', 'seagreen', 'slateblue']

  // create and bind data to our rects
  const rects = d3
    .select('#svg')
    .selectAll('.rect')
    .data(rectColors)
    .enter()
    .append('rect')
    .attr('height', 100)
    .attr('width', 100)
    .attr('x', (d, i) => i * 110)
    .attr('fill', 'lightgrey')

  // your code here
  rects
    .on('mouseenter', (event, datum) => {
      console.log({ event })
      d3.select(event.target).style('fill', datum)
    })
    .on('mouseout', (event) => {
      d3.select(event.target).style('fill', 'lightgrey')
    })

  setTimeout(() => {
    rects.dispatch('mouseout').on('mouseenter', null).on('mouseout', null)
  }, 3000)
}
createEvent()
