import styled from "styled-components";
import { useState, useRef } from "react";

const WeatherSettingWrapper = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  background-color: ${({ theme }) => theme.foregroundColor};
  box-sizing: border-box;
  padding: 20px;
`;

const Title = styled.div`
  font-size: 28px;
  color: ${({ theme }) => theme.titleColor};
  margin-bottom: 30px;
`;

const StyledLabel = styled.label`
  display: block;
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 15px;
`;

const StyledInputList = styled.input`
  display: block;
  box-sizing: border-box;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.textColor};
  outline: none;
  width: 100%;
  max-width: 100%;
  color: ${({ theme }) => theme.textColor};
  font-size: 16px;
  padding: 7px 10px;
  margin-bottom: 40px;
  border-radius: 5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    user-select: none;
    margin: 0;
    letter-spacing: 0.3px;
    line-height: 1;
    cursor: pointer;
    overflow: visible;
    text-transform: none;
    border: 1px solid transparent;
    background-color: transparent;
    padding: 0.5rem 1rem;
    border-radius: 5px;

    &:focus,
    &.focus {
      outline: 0;
      box-shadow: none;
    }

    &::-moz-focus-inner {
      padding: 0;
      border-style: none;
    }
  }
`;

const Back = styled.button`
  && {
    color: ${({ theme }) => theme.textColor};
    border-color: ${({ theme }) => theme.textColor};
  }
`;

const Save = styled.button`
  && {
    color: white;
    background-color: #40a9f3;
  }
`;

const locations = [
  "嘉義縣",
  "新北市",
  "嘉義市",
  "新竹縣",
  "新竹市",
  "臺北市",
  "臺南市",
  "宜蘭縣",
  "苗栗縣",
  "雲林縣",
  "花蓮縣",
  "臺中市",
  "臺東縣",
  "桃園市",
  "南投縣",
  "高雄市",
  "金門縣",
  "屏東縣",
  "基隆市",
  "澎湖縣",
  "彰化縣",
  "連江縣",
];

const WeatherSetting = ({ setCurpage }) => {
  const [locationName, setLocationName] = useState("金門縣");
  const inputLocationRef = useRef(null);
  /* controlled Components */
  const handleChangeLocationName = (e) => {
    console.log(e.target.value);
    setLocationName(e.target.value);
  };
  const handleClickSave = () => {
    /* controlled Components */
    if (locations.includes(locationName)) {
      console.log(`儲存的地區資訊為：${locationName}`);
      setCurpage("WeatherCard");
    } else {
      alert(`儲存失敗：您輸入的 ${locationName} 並非有效的地區`);
      return;
    }
    /* useRef-Uncontrolled Components */
    // const locationName = inputLocationRef.current.value;
    // console.log(locationName);
  };
  const renderCount = useRef(0);

  return (
    <WeatherSettingWrapper>
      {(renderCount.current += 1)}
      {console.log("render", renderCount.current)}
      <Title>設定</Title>
      <StyledLabel htmlFor="location">地區</StyledLabel>
      <StyledInputList
        list="location-list"
        id="location"
        name="location"
        /* controlled Components */
        onChange={handleChangeLocationName}
        value={locationName}

        /* uncontrolled Components 設定初始值 */
        // ref={inputLocationRef}
        // defaultValue={locationName}
      ></StyledInputList>
      <datalist id="location-list">
        {/* 定義 datalist 中的 options*/}

        {locations.map((location, index) => (
          <option key={index} value={location}>
            {location}
          </option>
        ))}
      </datalist>
      <ButtonGroup>
        <Back onClick={() => setCurpage("WeatherCard")}>返回</Back>
        <Save onClick={handleClickSave}>儲存</Save>
      </ButtonGroup>
    </WeatherSettingWrapper>
  );
};

export default WeatherSetting;
