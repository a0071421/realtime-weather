import styled, { css, keyframes } from "styled-components";
import { useState, useEffect, useCallback, useMemo } from "react";
import "./WeatherApp.css";
import WeatherIcon from "./components/WeatherIcon";
import axios from "axios";

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
import { ReactComponent as RefreshIcon } from "./images/refresh.svg";
import { ReactComponent as LoadingIcon } from "./images/loading.svg";

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

const rotate = keyframes`
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
`;

const Refresh = styled.div`
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
    animation: ${rotate} infinite 1.5s linear;
    animation-duration: ${({ isLoading }) => (isLoading ? "1.5s" : "0s")};
  }
`;

const fetchSunRiseAndSet = (locationName) => {
  const now = new Intl.DateTimeFormat("zh-TW", {})
    .format(new Date())
    .replace(/\//g, "-");
  return axios
    .get(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/A-B0062-001?Authorization=CWB-96A8FAF2-BE73-469B-AA3E-17A77A2F8DF6&locationName=${locationName}&dataTime=${now}`
    )
    .then((res) => {
      const location = res.data.records.locations.location[0];
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

const getMoment = ({
  observationTime,
  time: { dataTime, sunrise, sunset },
}) => {
  if (dataTime) {
    const observationTimestamp = new Date(observationTime).getTime();
    const sunriseTimestamp = new Date(`${dataTime} ${sunrise}`).getTime();
    const sunsetTimestamp = new Date(`${dataTime} ${sunset}`).getTime();
    return sunriseTimestamp <= observationTimestamp &&
      observationTimestamp <= sunsetTimestamp
      ? "day"
      : "night";
  } else {
    return;
  }
};

const fetchCurWeather = async () => {
  const res = await axios.get(
    "https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-96A8FAF2-BE73-469B-AA3E-17A77A2F8DF6&locationName=臺北"
  );
  const curWeather = res.data.records.location[0];
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
};

const fetchWeatherForecast = () => {
  return axios
    .get(
      "https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-96A8FAF2-BE73-469B-AA3E-17A77A2F8DF6&locationName=臺北市"
    )
    .then((res) => {
      const weatherForecast = res.data.records.location[0];
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
    time: {
      dataTime: "",
      sunrise: "",
      sunset: "",
    },
    isLoading: true,
  });
  const {
    observationTime,
    locationName,
    temperature,
    windSpeed,
    humid,
    description,
    weatherCode,
    rainPossibility,
    comfortability,
    time,
    isLoading,
  } = curWeather;
  const fetchData = useCallback(() => {
    console.log("useCallback");
    const fetchWeatherData = async () => {
      const [weatherEle, weatherForecast, sunriseAndSet] = await Promise.all([
        fetchCurWeather(),
        fetchWeatherForecast(),
        fetchSunRiseAndSet("臺北市"),
      ]);

      console.log("useCallback done");
      setCurWeather({
        ...weatherEle,
        ...weatherForecast,
        ...sunriseAndSet,
        isLoading: false, // 資料載入完畢
      });
    };

    // 一開始畫面載入或使用者點選「更新按鈕」
    setCurWeather((prev) => ({
      ...prev,
      isLoading: true,
    }));

    fetchWeatherData();
  }, []);

  const moment = useMemo(() => {
    console.log("moment memo");
    return getMoment(curWeather);
  }, [curWeather]);

  useEffect(() => {
    console.log("execute function in useEffect");
    fetchData();
  }, [fetchData]);

  return (
    <Container>
      {console.log("render")}
      {console.log(isLoading)}
      <WeatherCard>
        <Location>{locationName}</Location>
        <Description>
          {description} {comfortability}
        </Description>
        <CurrentWeather>
          <Temperature>
            {Math.round(temperature)} <Celsius>°C</Celsius>
          </Temperature>
          <WeatherIcon curWeatherCode={weatherCode} moment={moment || "day"} />
        </CurrentWeather>
        <AirFlow>
          <AirFlowIcon />
          {windSpeed} m/h
        </AirFlow>
        <Rain>
          <RainIcon />
          {Math.round(rainPossibility)} %
        </Rain>
        <Refresh onClick={fetchData} isLoading={isLoading}>
          最後觀測時間:
          {new Intl.DateTimeFormat("zh-TW", {
            hour: "numeric",
            minute: "numeric",
          }).format(new Date(observationTime))}{" "}
          {isLoading ? <LoadingIcon /> : <RefreshIcon />}
        </Refresh>
      </WeatherCard>
    </Container>
  );
};

export default WeatherApp;
