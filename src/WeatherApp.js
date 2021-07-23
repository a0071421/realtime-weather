import styled, { css, keyframes, ThemeProvider } from "styled-components";
import { useState, useEffect, useMemo } from "react";
import WeatherCard from "./components/WeatherCard";
import useWeatherApi from "./useWeatherApi";
import WeatherSetting from "./components/WeatherSetting";

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

const theme = {
  light: {
    backgroundColor: "#ededed",
    foregroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px 0 #999999",
    titleColor: "#212121",
    temperatureColor: "#757575",
    textColor: "#828282",
  },
  dark: {
    backgroundColor: "#1F2022",
    foregroundColor: "#121416",
    boxShadow:
      "0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)",
    titleColor: "#f9f9fa",
    temperatureColor: "#dddddd",
    textColor: "#cccccc",
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

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

const WeatherApp = () => {
  console.log("invoke function component");
  const [curWeather, fetchData] = useWeatherApi();
  const [curTheme, setCurTheme] = useState("light");
  const [curPage, setCurpage] = useState("WeatherCard");
  const moment = useMemo(() => {
    console.log("moment memo");
    return getMoment(curWeather);
  }, [curWeather]);

  // 根據 moment 決定要使用亮色或暗色主題
  useEffect(() => {
    setCurTheme(moment === "night" ? "dark" : "light");
  }, [moment]);
  return (
    <ThemeProvider theme={theme[curTheme]}>
      <Container>
        {console.log("render")}
        {curPage === "WeatherCard" && (
          <WeatherCard
            curWeather={curWeather}
            moment={moment}
            fetchData={fetchData}
            setCurpage={setCurpage}
          />
        )}
        {curPage === "WeatherSetting" && (
          <WeatherSetting setCurpage={setCurpage} />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default WeatherApp;
