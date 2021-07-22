import styled, { css } from "styled-components";
import { useState, useEffect, useCallback, useMemo } from "react";
import "./WeatherApp.css";
import WeatherIcon from "./components/WeatherIcon";

/* 定義許多組件都會共用到的樣式 */
/* const buttonDefault = () => css`
  display: block;
  width: 120px;
  height: 30px;
  font-size: 14px;
  background-color: transparent;
  color: #212121;
`;

// 和 CSS 一樣，同樣的樣式後面寫的會覆蓋前面寫的
const rejectButton = styled.button`
  ${buttonDefault}
  background-color: red;
`

const acceptButton = styled.button`
  ${buttonDefault}
  background-color: green;
` 
*/

// 載入icons
import { ReactComponent as AirFlowIcon } from "./images/airFlow.svg";
import { ReactComponent as RainIcon } from "./images/rain.svg";
import { ReactComponent as RedoIcon } from "./images/refresh.svg";

const Container = styled.div`
  background-color: #ededed;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: 0 1px 3px 0 #999999;
  background-color: #f9f9f9;
  box-sizing: border-box;
  padding: 30px 15px;
`;

const Location = styled.div`
  font-size: 28px;
  color: #212121;
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: #828282;
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: #757575;
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 300;
  color: #828282;
  margin-bottom: 20px;
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;
const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 300;
  color: #828282;
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Redo = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: #828282;
  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
`;

const fetchSunRiseAndSet = (locationName) => {
  const now = new Intl.DateTimeFormat("zh-TW", {})
    .format(new Date())
    .replace(/\//g, "-");
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/A-B0062-001?Authorization=CWB-96A8FAF2-BE73-469B-AA3E-17A77A2F8DF6&locationName=${locationName}&dataTime=${now}`
  )
    .then((res) => res.json())
    .then((data) => {
      const location = data.records.locations.location[0];
      const filterSun = location.time[0].parameter
        .filter((timeParam) =>
          ["日出時刻", "日沒時刻"].includes(timeParam.parameterName)
        )
        .reduce((acc, timeParam) => {
          const keyVal =
            timeParam.parameterName === "日出時刻" ? "sunrise" : "sunset";
          acc[keyVal] = timeParam.parameterValue;
          return acc;
        }, {});
      return {
        locationName: location.locationName,
        time: {
          dataTime: location.time[0].dataTime,
          ...filterSun,
        },
      };
    });
};

const getMoment = async () => {
  const sunriseAndSet = await fetchSunRiseAndSet("臺北市");
  const {
    time: { dataTime, sunrise, sunset },
  } = sunriseAndSet;
  const sunriseTimestamp = new Date(`${dataTime} ${sunrise}`);
  const sunsetTimestamp = new Date(`${dataTime} ${sunset}`);
  const now = new Date().getTime();
  return sunriseTimestamp <= now && now <= sunsetTimestamp ? "day" : "night";
};

const fetchCurWeather = async () => {
  return await fetch(
    "https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-96A8FAF2-BE73-469B-AA3E-17A77A2F8DF6&locationName=臺北"
  )
    .then((res) => res.json())
    .then((data) => {
      const curWeather = data.records.location[0];
      const weatherElements = curWeather.weatherElement.reduce(
        (neededElements, item) => {
          if (["WDSD", "TEMP", "HUMD"].includes(item.elementName)) {
            neededElements[item.elementName] = item.elementValue;
          }
          return neededElements;
        },
        {}
      );
      return {
        observationTime: curWeather.time.obsTime,
        locationName: curWeather.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD,
      };
      /* setCurWeather((prev) => {
        return {
          ...prev,
          observationTime: curWeather.time.obsTime,
          locationName: curWeather.locationName,
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD,
          description: "",
          weatherCode: 0,
          rainPossibility: 0,
          comfortability: "",
        };
      }); */
    });
};

const fetchWeatherForecast = () => {
  return fetch(
    "https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-96A8FAF2-BE73-469B-AA3E-17A77A2F8DF6&locationName=臺北市"
  )
    .then((res) => res.json())
    .then((data) => {
      const weatherForecast = data.records.location[0];
      const weatherElements = weatherForecast.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
      /* setCurWeather((prev) => {
        return {
          ...prev,
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        };
      }); */
    });
};

const WeatherApp = () => {
  console.log("invoke function component");
  const [curWeather, setCurWeather] = useState({
    observationTime: new Date(),
    locationName: "",
    temperature: 0,
    windSpeed: 0,
    humid: 0,
    description: "",
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: "",
  });

  const fetchData = useCallback(() => {
    console.log("useCallback");
    const fetchWeatherData = async () => {
      const [curWeather, weatherForecast, sunriseAndSet] = await Promise.all([
        fetchCurWeather(),
        fetchWeatherForecast(),
      ]);

      console.log("useCallback done");
      setCurWeather({
        ...curWeather,
        ...weatherForecast,
      });
    };

    fetchWeatherData();
  }, []);

  useEffect(() => {
    console.log("execute function in useEffect");
    fetchData();
  }, [fetchData]);

  return (
    <Container>
      {console.log("render")}
      <WeatherCard>
        <Location>{curWeather.locationName}</Location>
        <Description>
          {curWeather.description} {curWeather.comfortability}
        </Description>
        <CurrentWeather>
          <Temperature>
            {Math.round(curWeather.temperature)} <Celsius>°C</Celsius>
          </Temperature>
          <WeatherIcon curWeatherCode={curWeather.weatherCode} moment="day" />
        </CurrentWeather>
        <AirFlow>
          <AirFlowIcon />
          {curWeather.windSpeed} m/h
        </AirFlow>
        <Rain>
          <RainIcon />
          {Math.round(curWeather.rainPossibility)} %
        </Rain>
        <Redo onClick={fetchData}>
          最後觀測時間:
          {new Intl.DateTimeFormat("zh-TW", {
            hour: "numeric",
            minute: "numeric",
          }).format(new Date(curWeather.observationTime))}{" "}
          <RedoIcon />
        </Redo>
      </WeatherCard>
    </Container>
  );
};

export default WeatherApp;
