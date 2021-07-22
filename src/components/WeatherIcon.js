import styled from "styled-components";
import { useState, useEffect, useMemo } from "react";

import { ReactComponent as DayCloudy } from "../images/day-cloudy.svg";
import { ReactComponent as DayThunderStorm } from "../images/day-thunderstorm.svg";
import { ReactComponent as DayClear } from "../images/day-clear.svg";
import { ReactComponent as DayCloudyFog } from "../images/day-cloudy-fog.svg";
import { ReactComponent as DayFog } from "../images/day-fog.svg";
import { ReactComponent as DayPartiallyclearWithRain } from "../images/day-partially-clear-with-rain.svg";
import { ReactComponent as DaySnowing } from "../images/day-snowing.svg";

import { ReactComponent as NightClear } from "../images/night-clear.svg";
import { ReactComponent as NightCloudy } from "../images/night-cloudy.svg";
import { ReactComponent as NightThunderStorm } from "../images/night-thunderstorm.svg";
import { ReactComponent as NightCloudyFog } from "../images/night-cloudy-fog.svg";
import { ReactComponent as NightFog } from "../images/night-fog.svg";
import { ReactComponent as NightPartiallyclearWithRain } from "../images/night-partially-clear-with-rain.svg";
import { ReactComponent as NightSnowing } from "../images/night-snowing.svg";

const IconContainer = styled.div`
  flex-basis: 30%;
  /* svg {
    max-height: 110px;
  } */
`;

// 天氣類別代碼 from https://opendata.cwb.gov.tw/opendatadoc/MFC/D0047.pdf
const weatherTypes = {
  isThunderstorm: [15, 16, 17, 18, 21, 22, 33, 34, 35, 36, 41],
  isClear: [1],
  isCloudyFog: [25, 26, 27, 28],
  isCloudy: [2, 3, 4, 5, 6, 7],
  isFog: [24],
  isPartiallyClearWithRain: [
    8, 9, 10, 11, 12, 13, 14, 19, 20, 29, 30, 31, 32, 38, 39,
  ],
  isSnowing: [23, 37, 42],
};

const weatherIcons = {
  day: {
    isThunderstorm: <DayThunderStorm />,
    isClear: <DayClear />,
    isCloudyFog: <DayCloudyFog />,
    isCloudy: <DayCloudy />,
    isFog: <DayFog />,
    isPartiallyClearWithRain: <DayPartiallyclearWithRain />,
    isSnowing: <DaySnowing />,
  },

  night: {
    isThunderstorm: <NightThunderStorm />,
    isClear: <NightClear />,
    isCloudyFog: <NightCloudyFog />,
    isCloudy: <NightCloudy />,
    isFog: <NightFog />,
    isPartiallyClearWithRain: <NightPartiallyclearWithRain />,
    isSnowing: <NightSnowing />,
  },
};

// 將天氣代碼轉為天氣型態 ex. 1 => "isThunderstorm"
const weatherCodeToType = (weatherCode) => {
  const [weatherTypeResult] =
    Object.entries(weatherTypes).find(([type, codes]) => {
      return codes.includes(Number(weatherCode));
    }) || [];
  return weatherTypeResult;
};

const WeatherIcon = ({ curWeatherCode, moment }) => {
  console.log(curWeatherCode, moment);
  console.log("invoke function component icon");
  const [curWeatherIcon, setCurWeatherIcon] = useState(["isClear"]);
  const weatherIconResult = useMemo(() => {
    console.log("useMemo");
    return weatherCodeToType(curWeatherCode);
  }, [curWeatherCode]);
  useEffect(() => {
    console.log("execute function in useEffect from icon");
    setCurWeatherIcon(weatherIconResult);
  }, [weatherIconResult]);
  return (
    <IconContainer>
      {console.log("render icon")}
      {weatherIcons[moment][curWeatherIcon]}
    </IconContainer>
  );
};

export default WeatherIcon;
