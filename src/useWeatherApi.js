import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const fetchSunRiseAndSet = (sunriseCityName) => {
  const now = new Intl.DateTimeFormat("zh-TW", {})
    .format(new Date())
    .replace(/\//g, "-");
  return axios
    .get(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/A-B0062-001?Authorization=CWB-96A8FAF2-BE73-469B-AA3E-17A77A2F8DF6&locationName=${sunriseCityName}&dataTime=${now}`
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
        locationName: location.locationName || "",
        time: {
          dataTime: location.time[0].dataTime,
          ...filterSun,
        },
      };
    });
};

const fetchCurWeather = async (locationName) => {
  const res = await axios.get(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-96A8FAF2-BE73-469B-AA3E-17A77A2F8DF6&locationName=${locationName}`
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

const fetchWeatherForecast = (cityName) => {
  return axios
    .get(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-96A8FAF2-BE73-469B-AA3E-17A77A2F8DF6&locationName=${cityName}`
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

const useWeatherApi = (currentLocation, setCurpage) => {
  console.log("useWeatherApi");
  const { cityName, locationName, sunriseCityName } = currentLocation;
  const [curWeather, setCurWeather] = useState({
    observationTime: new Date(),
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

  const fetchData = useCallback(() => {
    console.log("useCallback");
    const fetchWeatherData = async () => {
      const [weatherEle, weatherForecast, sunriseAndSet] = await Promise.all([
        fetchCurWeather(locationName),
        fetchWeatherForecast(cityName),
        fetchSunRiseAndSet(sunriseCityName),
      ]);

      console.log("useCallback done");
      setCurWeather({
        ...weatherEle,
        ...weatherForecast,
        ...sunriseAndSet,
        isLoading: false, // 資料載入完畢
      });
      setCurpage("WeatherCard");
    };

    // 一開始畫面載入或使用者點選「更新按鈕」
    // setCurWeather((prev) => ({
    //   ...prev,
    //   isLoading: true,
    // }));

    fetchWeatherData();
  }, [currentLocation]);

  useEffect(() => {
    console.log("execute function in useEffect");
    fetchData();
  }, [fetchData]);

  return [curWeather, fetchData];
};

export default useWeatherApi;
