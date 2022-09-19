/* eslint-disable react/jsx-fragments */
import React, { useRef, useEffect } from "react";
// import _ from "lodash";
import * as d3 from "d3";
// import "index.css";

const DensityContours = (props) => {
  const {
    ContourData,
    cData,
    chartView,
    chartStyle,
    bandWidth,
    thresholds,
    interval,
    dimensions,
    scatterOp,
    cellSize
  } = props;
  const svgRef = useRef();
  const wrapperRef = useRef();

  const getX = (d) =>
    chartView[0] === 1 ? d.X : chartView[0] === 2 ? d.Y : d.Z;

  const getY = (d) =>
    chartView[1] === 1 ? d.X : chartView[1] === 2 ? d.Y : d.Z;

  const axisLabel = (d) => `Dimension ${d}: `;

  const margin = {
    top: 20,
    right: 30,
    bottom: 30,
    left: 40
  };

  const x = d3
    .scaleLinear()
    .domain(d3.extent(ContourData, (d) => getX(d)))
    .nice()
    .rangeRound([margin.left, dimensions.width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(ContourData, (d) => getY(d)))
    .nice()
    .rangeRound([dimensions.height - margin.bottom, margin.top]);

  const buildAxis = (svg) => {
    svg.selectAll(".axisTitle").remove();

    svg
      .select(".x-axis")
      .attr("transform", `translate(0,${dimensions.height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    svg
      .select(".y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0));
    svg
      .append("text")
      .attr("class", "axisTitle")
      .attr("text-anchor", "end")
      .attr("x", dimensions.width)
      .attr("y", dimensions.height + margin.top + 20)
      .text(axisLabel(chartView[0]));

    svg
      .append("text")
      .attr("class", "axisTitle")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -margin.top)
      .text(axisLabel(chartView[1]));
  };

  const BuildScatterChart = (svg, dd) => {
    const { data, color, centerX, centerY, avgDist } = dd;
    const svgContent = svg
      .append("g")
      .attr("class", "content")
      .attr("clipPath", "url(#contourChart)");

    const scatterColor = d3.color(color).darker(1);

    if (chartStyle === "contour" || chartStyle === "both") {
      const contours = d3
        .contourDensity()
        .x((d) => x(getX(d)))
        .y((d) => y(getY(d)))
        .size([dimensions.width, dimensions.height])
        .cellSize(cellSize)
        .thresholds(thresholds)
        .bandwidth(bandWidth)(data);

      const contourColor = d3.color(color);
      const contourStroke = d3.color(color);
      contourStroke.opacity = 0.2;

      const clrScale = d3
        .scaleLinear()
        .domain([0, contours.length])
        .range([scatterOp / 100, avgDist / 50]);

      svgContent
        .selectAll("path")
        .data(contours)
        .enter()
        .append("path")
        .attr("class", "spContours")
        .attr("d", d3.geoPath())
        .attr("fill", "none")
        .attr("stroke", (_, i) =>
          (i + interval) % interval === 0 ? color : contourStroke
        )
        .attr("fill", (d, i) => {
          const clr = d3.color(color);
          clr.opacity = clrScale(i);
          return (i + interval) % interval === 0 ? clr : "none";
        })
        .attr("stroke-linejoin", "round");

      svgContent
        .append("circle")
        .attr("class", "spPoint")
        .attr("cx", x(centerX))
        .attr("cy", y(centerY))
        .attr("r", 3)
        .attr("stroke", scatterColor)
        .attr("fill", scatterColor);
    }

    if (chartStyle === "scatter" || chartStyle === "both") {
      const nodes = svgContent
        .selectAll(`.spPoint`)
        .append("g")
        .data(data, (d) => d);

      nodes
        .enter()
        .append("circle")
        .attr("class", "spPoint")
        .attr("stroke", chartStyle === "both" ? scatterColor : color)
        .attr("cx", (d) => x(getX(d)))
        .attr("cy", (d) => y(getY(d)))
        .attr("r", chartStyle === "both" ? 1 : 1)
        .attr("opacity", scatterOp / 10)
        .attr("fill", color);
    }
  };

  useEffect(() => {
    if (dimensions && dimensions.width && dimensions.height) {
      const svg = d3.select(svgRef.current);
      svg.selectAll(".content").remove();

      buildAxis(svg);

      for (let d of cData) {
        d.visible && BuildScatterChart(svg, d);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chartView,
    chartStyle,
    bandWidth,
    thresholds,
    interval,
    scatterOp,
    cellSize,
    cData
  ]);

  return (
    <div ref={wrapperRef} style={{ marginBottom: "2rem" }}>
      <svg
        ref={svgRef}
        className="corrD3_svgBox"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="contourChart">
            <rect x="0" y="0" width="100%" height="100%" />
          </clipPath>
        </defs>
        <g className="x-axis" />
        <g className="y-axis" />
      </svg>
    </div>
  );
};

export default DensityContours;
