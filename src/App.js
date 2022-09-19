import React, { useEffect, useState } from "react";
import _ from "lodash";
import "./App.css";
import {
  Select,
  Typography,
  Slider,
  MenuItem,
  Checkbox,
  RadioGroup,
  Radio,
  FormGroup,
  FormControl,
  FormControlLabel,
  Tooltip
} from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/styles";
import DensityContours from "./DensityContours";
import { ContourData } from "./ContourData";

const useStyles = makeStyles((theme) => ({
  dropDownStyle: {
    width: 120,
    background: "white",
    border: 2,
    //borderRadius: 3,
    color: "primary",
    height: 48
  },
  wrapperDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  chartStyleList: {
    paddingLeft: "100px",
    paddingTop: "40px",
    flexDirection: "column !important"
  },
  chartStyleList2: {
    flexDirection: "column !important"
  },
  sliderDiv: {
    width: "100vh",
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  sliderStyle: {
    width: "400px"
  }
}));

function App() {
  // const [data, setData] = useState(
  //   Array.from({ length: 50 }, () => Math.round(Math.random() * 100))
  // );
  const classes = useStyles();
  const [view, setView] = useState([1, 2]);
  const [viewLabel, setViewLabel] = useState("Front");
  const [chartStyle, setChartStyle] = useState("contour");
  const [interval, setInterval] = useState(5);
  const [bandWidth, setBandWidth] = useState(20);
  const [thresholds, setThresholds] = useState(40);
  const [scatOp, setScatOp] = useState(8);
  const [cellSize, setCellSize] = useState(4);
  const colors = [
    "rgb(255, 0, 0)",
    "rgb(255, 198, 0)",
    "rgb(255, 51, 204)",
    "rgb(51, 204, 102)",
    "rgb(102, 51, 103)",
    "rgb(0, 153, 204)"
  ];
  const [cData, setCData] = useState([]);

  const dimensions = {
    width: 1000,
    height: 500
  };

  const getX = (d) => (view[0] === 1 ? d.X : view[0] === 2 ? d.Y : d.Z);

  const getY = (d) => (view[1] === 1 ? d.X : view[1] === 2 ? d.Y : d.Z);

  const handleChange = (event) => {
    setViewLabel(event.target.value);
    switch (event.target.value) {
      default:
      case "front":
        setView([1, 2]);
        break;
      case "Side":
        setView([3, 2]);
        break;
      case "Top":
        setView([3, 1]);
        break;
    }
  };

  const calcAvgDistanceFromCenter = (cX, cY, dd) => {
    const s = _.sumBy(
      dd,
      (d) => Math.pow(cX - getX(d), 2) + Math.pow(cY - getY(d), 2)
    );
    const avgDist = Math.sqrt(s);
    return dd.length / avgDist;
  };

  useEffect(() => {
    setCData([]);
  }, [view]);

  useEffect(() => {
    if (cData.length === 0) {
      const gData = _.groupBy(ContourData, (x) => x.Cluster);
      const data = [];
      for (const key in gData) {
        const centX = _.sumBy(gData[key], (d) => getX(d)) / gData[key].length;
        const centY = _.sumBy(gData[key], (d) => getY(d)) / gData[key].length;
        data.push({
          data: gData[key],
          color: colors[key - 1],
          visible: true,
          centerX: centX,
          centerY: centY,
          avgDist: calcAvgDistanceFromCenter(centX, centY, gData[key])
        });
      }
      setCData(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ContourData, cData]);

  const handleRadioChange = (event) => {
    setChartStyle(event.target.value);
  };
  const handleBWSliderChange = (event, newValue) => {
    setBandWidth(newValue);
  };
  const handleTSliderChange = (event, newValue) => {
    setThresholds(newValue);
  };
  const handleIntSliderChange = (event, newValue) => {
    setInterval(newValue);
  };
  const handleCBChange = (event) => {
    const i = +event.target.value;
    const cd = _.cloneDeep(cData);
    cd[i].visible = !cd[i].visible;
    setCData(cd);
  };

  const showAxis = () => {
    return (
      <div style={{ paddingLeft: "100px" }}>
        <Select
          className={classes.dropDownStyle}
          labelId="select-label"
          id="select"
          value={viewLabel}
          onChange={handleChange}
        >
          <MenuItem value="Front">Front</MenuItem>
          <MenuItem value="Side">Side</MenuItem>
          <MenuItem value="Top">Top</MenuItem>
        </Select>
      </div>
    );
  };

  const showChartTypes = () => {
    const rg = (label, value) => {
      return (
        <FormControlLabel
          checked={chartStyle === value}
          control={<Radio />}
          onChange={handleRadioChange}
          value={value}
          name="cs-radio-button"
          label={value}
        />
      );
    };

    return (
      <FormControl>
        <RadioGroup
          className={classes.chartStyleList}
          defaultValue="scatter"
          name="cs-radio-button"
          onChange={handleRadioChange}
        >
          {rg("Contour", "contour")}
          {rg("Scatter", "scatter")}
          {rg("Both", "both")}
        </RadioGroup>
      </FormControl>
    );
  };

  const showContours = () => {
    const getToolTip = (index) => {
      return !_.isUndefined(cData[index]) ? `${cData[index].data.length}` : "0";
    };

    const fc = (tt) => {
      const HtmlTooltip = withStyles((theme) => ({
        tooltip: {
          backgroundColor: "#f5f5f9",
          color: "rgba(0, 0, 0, 0.87)",
          maxWidth: 220,
          fontSize: "14px",
          border: "1px solid #dadde9"
        }
      }))(Tooltip);

      return (
        <HtmlTooltip
          key={cData[tt - 1].color}
          aria-label={`cluster${tt}`}
          placement="right"
          title={
            <React.Fragment>
              <Typography color="inherit">{`Cluster ${tt}`}</Typography>
              <em>{"Total Points:"}</em>
              <b>{getToolTip(tt - 1)}</b>
              <div>{`Divide By Avg Distance = ${_.round(
                cData[tt - 1].avgDist,
                1
              )}`}</div>
            </React.Fragment>
          }
        >
          {/* <Tooltip
          key={cData[tt - 1].color}
          title={getToolTip(tt)}
          aria-label={`cluster${tt}`}
          placement="right"
        > */}
          <FormControlLabel
            control={
              <Checkbox
                style={{ color: cData[tt - 1].color }}
                // checked={clusters.c1}
                checked={cData[tt - 1].visible}
                value={tt - 1}
                onChange={(e) => handleCBChange(e)}
                name="Clusters"
              />
            }
            label={`Cluster ${tt}`}
          />
          {/* </Tooltip> */}
        </HtmlTooltip>
      );
    };

    return (
      <FormGroup className={classes.chartStyleList}>
        {cData.map((x, i) => fc(i + 1))}
      </FormGroup>
    );
  };

  const showSlider = (
    id,
    label,
    value,
    min,
    max,
    step,
    labelDisp,
    ariaLabel,
    handler
  ) => {
    return (
      <div className={classes.sliderDiv}>
        <Typography
          id={id}
          style={{ paddingRight: "10px", paddingLeft: "100px" }}
        >
          {label}
        </Typography>
        <Slider
          defaultValue={value}
          min={min}
          max={max}
          steps={step}
          // disable={chartStyle === "scatter"}
          className={classes.sliderStyle}
          valueLabelDisplay={labelDisp}
          getAriaValueText={(v) => v}
          value={value}
          onChange={handler}
          aria-labelledby={ariaLabel}
        />
      </div>
    );
  };

  return (
    cData.length > 0 && (
      <React.Fragment>
        <h2>Contour Map in MaterialUI Test</h2>
        <div className={classes.wrapperDiv}></div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {showAxis()}
            {showChartTypes()}
            <FormControl
              required
              component="fieldset"
              className={classes.formControl}
            >
              {showContours()}
            </FormControl>{" "}
          </div>
          <DensityContours
            ContourData={ContourData}
            cData={cData}
            chartView={view}
            chartStyle={chartStyle}
            bandWidth={bandWidth}
            thresholds={thresholds}
            interval={interval}
            dimensions={dimensions}
            scatterOp={scatOp}
            cellSize={cellSize}
          />
        </div>
        {showSlider(
          "continuous-slider",
          "BandWidth",
          bandWidth,
          1,
          100,
          1,
          "on",
          "input-slider",
          handleBWSliderChange
        )}
        {showSlider(
          "continuous-slider2",
          "Thresholds",
          thresholds,
          1,
          200,
          1,
          "on",
          "input-slider",
          handleTSliderChange
        )}
        {showSlider(
          "continuous-slider",
          "Band Spacing",
          interval,
          1,
          10,
          1,
          "auto",
          "descrete-slider",
          handleIntSliderChange
        )}
        {showSlider(
          "continuous-slider2",
          "Cell Size",
          cellSize,
          1,
          20,
          1,
          "auto",
          "descrete-slider",
          (x, val) => setCellSize(val)
        )}
        {showSlider(
          "continuous-slider2",
          "Contour/Scatter Opacity",
          scatOp,
          1,
          10,
          1,
          "auto",
          "descrete-slider",
          (x, val) => setScatOp(val)
        )}
      </React.Fragment>
    )
  );
}

export default App;
