import React, { Component } from "react";
import "./Child1.css"
import * as d3 from "d3";

class Child1 extends Component {
  state = { 
    company: "Apple", // Default Company
    selectedMonth: 'November' //Default Month
  };

  componentDidMount() {
    // console.log(this.props.csv_data) // Use this data as default. When the user will upload data this props will provide you the updated data
    this.renderChart();
  }

  componentDidUpdate() {
    // console.log(this.props.csv_data)
    this.renderChart();
  }

  // dynamically change state of company and selectedMonth
  companyChange = (event) => {
    this.setState({ company: event.target.value });
  };

  monthChange = (event) => {
    this.setState({ selectedMonth: event.target.value });
  };

  // create line chart
  renderChart = () => {
    // filter data
    const filteredData = this.props.csv_data
    .filter(d => {
      const d_date = new Date(d.Date);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return d.Company === this.state.company && months[d_date.getMonth()] === this.state.selectedMonth; 
    });
    // console.log("Filtered data:", filteredData)

    // parse date string
    // filteredData.forEach(d => d.Date = d.Date);
    // console.log("toDateString:", filteredData);

    // set dimensions and margins
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    const w = 500 - margin.left - margin.right;
    const h = 300 - margin.top - margin.bottom;

    // create svg container
    const svg = d3.select(".lineChart")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .style("overflow", "visible")
      .select("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // define scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(filteredData, d => d.Date))
      .range([0, w]);
    const yScale = d3.scaleLinear()
      .domain([d3.min(filteredData, d => Math.min(d.Open, d.Close)), d3.max(filteredData, d => Math.max(d.Open, d.Close))])
      .range([h, 0]);

    // create lines
    const openLine = d3.line()
      .x(d => xScale(d.Date))
      .y(d => yScale(d.Open))
      .curve(d3.curveCardinal);

    const closeLine = d3.line()
      .x(d => xScale(d.Date))
      .y(d => yScale(d.Close))
      .curve(d3.curveCardinal);

    // get and display paths for each line
    var openPath = openLine(filteredData);
    var closePath = closeLine(filteredData);
    svg.selectAll("path")
      .data([
        { path: openPath, color: '#b2df8a' }, 
        { path: closePath, color: '#e41a1c' }
      ])
      .join('path')
      .attr('d', d => d.path)
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 3);

    // add x and y axis
    svg.selectAll('.x.axis').data([null]).join('g').attr('class', 'x axis').attr('transform', `translate(0,${h + 10})`).call(d3.axisBottom(xScale));
    svg.selectAll('.y.axis').data([null]).join('g').attr('class', 'y axis').attr('transform', `translate(-10,0)`).call(d3.axisLeft(yScale));

    // rotate x-axis labels
    svg.selectAll('.x.axis text').attr('transform', 'rotate(45)').style('text-anchor', 'start').attr('dx', '0.5em').attr('dy', '0.5em');

    // create circles
    svg.selectAll('circle.open')
      .data(filteredData)
      .join('circle')
      .attr('class', 'open')
      .attr('cx', d => xScale(new Date(d.Date)))
      .attr('cy', d => yScale(d.Open))
      .attr('r', 4)
      .attr('fill', '#b2df8a')
      .on('mouseover', (event, d) => {
        const tooltip = d3.select(".tooltip");
        tooltip.style("visibility", "visible")
          .html(`Date: ${d.Date.toDateString()}<br>Open: ${d.Open.toFixed(2)}<br>Close: ${d.Close.toFixed(2)}<br>Difference: ${(d.Close - d.Open).toFixed(2)}`);
      })
      .on('mousemove', (event) => {
        const tooltip = d3.select(".tooltip");
        tooltip.style("top", `${event.pageY + 5}px`)
          .style("left", `${event.pageX + 5}px`);
      })
      .on('mouseout', () => {
        d3.select(".tooltip").style("visibility", "hidden");
      });

    svg.selectAll('circle.close')
      .data(filteredData)
      .join('circle')
      .attr('class', 'close')
      .attr('cx', d => xScale(new Date(d.Date)))
      .attr('cy', d => yScale(d.Close))
      .attr('r', 4)
      .attr('fill', '#e41a1c')
      .on('mouseover', (event, d) => {
        const tooltip = d3.select(".tooltip");
        tooltip.style("visibility", "visible")
          .html(`Date: ${d.Date.toDateString()}<br>Open: ${d.Open.toFixed(2)}<br>Close: ${d.Close.toFixed(2)}<br>Difference: ${(d.Close - d.Open).toFixed(2)}`);
      })
      .on('mousemove', (event) => {
        const tooltip = d3.select(".tooltip");
        tooltip.style("top", `${event.pageY + 5}px`)
          .style("left", `${event.pageX + 5}px`);
      })
      .on('mouseout', () => {
        d3.select(".tooltip").style("visibility", "hidden");
      });
    
    // legend
    svg.selectAll('.legend').remove();
    const legend = svg.selectAll('.legend')
    .data([
      { label: "Open", color: "#b2df8a" },
      { label: "Close", color: "#e41a1c" }
    ])
    .join('g')
    .attr('class', 'legend')
    .attr('transform', (d, i) => `translate(${w + 20}, ${i * 20})`);

    legend.append('rect')
      .attr('x', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', d => d.color);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .text(d => d.label);
  }

  render() {
    const options = ['Apple', 'Microsoft', 'Amazon', 'Google', 'Meta']; // Use this data to create radio button
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // Use this data to create dropdown

    return (
      <div className="child1">
        {/* Customizable section */}
        <div className="customizable">
          <div className="company">
            <label>Company:</label>
            {options.map((company) => (
              <span key={company} className="companyOptions">
                <input
                  type="radio"
                  id={company}
                  name="company"
                  value={company}
                  checked={this.state.company === company}
                  onChange={this.companyChange}
                />
                <label htmlFor={company}>{company}</label>
              </span>
            ))}
          </div>

          <div className="month">
            <label>Month:</label>
            <select 
              value={this.state.selectedMonth} 
              onChange={this.monthChange}
            >
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Graph */}
        <div className="graph">
          <svg className="lineChart"><g></g></svg>
          <div className="tooltip"></div>
        </div>
        
      </div>
    );
  }
}

export default Child1;