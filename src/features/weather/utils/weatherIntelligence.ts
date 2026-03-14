import type {
  CityWeatherBundle,
  CityWeatherIntelligence,
  CurrentConditions,
  DailyForecastPoint,
  HourlyForecastPoint,
  WeatherIntelligenceCard,
  WeatherIntelligenceCardId,
  WeatherIntelligenceSeverity,
} from "@/features/weather/types";

const unavailableCard = (
  id: WeatherIntelligenceCardId,
  label: string,
  detail: string
): WeatherIntelligenceCard => ({
  id,
  label,
  headline: "Fallback / 已降级",
  summary: "This signal is unavailable in the current normalized payload. / 当前标准化数据未提供该信号。",
  detail,
  severity: "low",
  status: "unavailable",
});

const toNumber = (value?: string): number | null => {
  if (!value || value === "--") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toMax = (values: Array<number | null>): number | null => {
  const present = values.filter((value): value is number => value !== null);
  return present.length ? Math.max(...present) : null;
};

const toMin = (values: Array<number | null>): number | null => {
  const present = values.filter((value): value is number => value !== null);
  return present.length ? Math.min(...present) : null;
};

const parseClockMinutes = (value?: string): number | null => {
  if (!value) {
    return null;
  }

  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
};

const formatWholeNumber = (value: number): string => String(Math.round(value));

const formatSingleDecimal = (value: number): string => value.toFixed(1);

const formatSeverityHeadline = (
  low: string,
  moderate: string,
  high: string,
  severity: WeatherIntelligenceSeverity
): string => {
  if (severity === "high") {
    return high;
  }

  if (severity === "moderate") {
    return moderate;
  }

  return low;
};

const buildPrecipitationCard = (
  hourly: HourlyForecastPoint[],
  today?: DailyForecastPoint
): WeatherIntelligenceCard => {
  const peakPop = toMax(hourly.map((point) => toNumber(point.pop)));
  const dailyPrecip = toNumber(today?.precip);

  if (peakPop === null && dailyPrecip === null) {
    return unavailableCard(
      "precipitation-risk",
      "Precipitation Risk / 降水风险",
      "Hourly precipitation probability and daily precipitation totals are unavailable. / 缺少小时降水概率和日降水量。"
    );
  }

  let severity: WeatherIntelligenceSeverity = "low";
  if ((peakPop ?? 0) >= 70 || (dailyPrecip ?? 0) >= 15) {
    severity = "high";
  } else if ((peakPop ?? 0) >= 40 || (dailyPrecip ?? 0) >= 5) {
    severity = "moderate";
  }

  const headline =
    peakPop !== null
      ? formatWholeNumber(peakPop) + "% peak chance"
      : formatSingleDecimal(dailyPrecip ?? 0) + " mm signal";

  const summary = formatSeverityHeadline(
    "Only a light precipitation signal is showing. / 当前降水信号偏轻。",
    "Carry a light rain option for later hours. / 后续时段建议备一件轻便雨具。",
    "Wet weather could interrupt outdoor plans. / 降水信号较强，可能影响户外安排。",
    severity
  );

  const detailParts: string[] = [];
  if (peakPop !== null) {
    detailParts.push("Peak PoP " + formatWholeNumber(peakPop) + "%");
  }
  if (dailyPrecip !== null) {
    detailParts.push("Daily precip " + formatSingleDecimal(dailyPrecip) + " mm");
  }

  return {
    id: "precipitation-risk",
    label: "Precipitation Risk / 降水风险",
    headline,
    summary,
    detail: detailParts.join(" · "),
    severity,
    status: "available",
  };
};

const buildTemperatureSwingCard = (
  hourly: HourlyForecastPoint[],
  today?: DailyForecastPoint
): WeatherIntelligenceCard => {
  const dailyHigh = toNumber(today?.tempMax);
  const dailyLow = toNumber(today?.tempMin);
  const hourlyTemperatures = hourly.map((point) => toNumber(point.temperature));
  const high = dailyHigh ?? toMax(hourlyTemperatures);
  const low = dailyLow ?? toMin(hourlyTemperatures);

  if (high === null || low === null) {
    return unavailableCard(
      "temperature-swing",
      "Temperature Swing / 温差波动",
      "High and low temperature signals are incomplete. / 缺少最高或最低温度信号。"
    );
  }

  const swing = Math.max(high - low, 0);
  const severity = swing >= 14 ? "high" : swing >= 8 ? "moderate" : "low";

  return {
    id: "temperature-swing",
    label: "Temperature Swing / 温差波动",
    headline: formatWholeNumber(swing) + "° swing",
    summary: formatSeverityHeadline(
      "Temperatures stay relatively steady through the day. / 日内温度波动较平稳。",
      "Layering will help as the day shifts. / 日内温差明显，分层穿着会更稳妥。",
      "Expect a sharp intraday change between cool and warm periods. / 日内冷热切换明显，需要提前预留穿搭余量。",
      severity
    ),
    detail: "Low " + formatWholeNumber(low) + "° · High " + formatWholeNumber(high) + "°",
    severity,
    status: "available",
  };
};

const buildDaylightCard = (today?: DailyForecastPoint): WeatherIntelligenceCard => {
  const sunriseMinutes = parseClockMinutes(today?.sunrise);
  const sunsetMinutes = parseClockMinutes(today?.sunset);

  if (
    sunriseMinutes === null ||
    sunsetMinutes === null ||
    sunsetMinutes <= sunriseMinutes
  ) {
    return unavailableCard(
      "daylight-window",
      "Daylight Window / 日照窗口",
      "Sunrise or sunset data is unavailable for this day. / 今日缺少日出或日落数据。"
    );
  }

  const totalMinutes = sunsetMinutes - sunriseMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const severity = totalMinutes < 10 * 60 ? "high" : totalMinutes < 12 * 60 ? "moderate" : "low";

  return {
    id: "daylight-window",
    label: "Daylight Window / 日照窗口",
    headline: hours + "h " + String(minutes).padStart(2, "0") + "m",
    summary: formatSeverityHeadline(
      "A broad daylight window supports flexible timing. / 日照窗口较宽，时间安排更灵活。",
      "The usable daylight window is balanced but not long. / 日照时段中等，适合中段安排户外活动。",
      "The daylight window is relatively short today. / 今日日照窗口偏短，户外安排需要更紧凑。",
      severity
    ),
    detail: (today?.sunrise ?? "--") + " → " + (today?.sunset ?? "--"),
    severity,
    status: "available",
  };
};

const buildComfortCard = (
  current: CurrentConditions | null,
  today?: DailyForecastPoint
): WeatherIntelligenceCard => {
  if (!current) {
    return unavailableCard(
      "comfort-severity",
      "Comfort Severity / 体感压力",
      "Current conditions are unavailable. / 缺少当前天气数据。"
    );
  }

  const feelsLike = toNumber(current.feelsLike);
  const humidity = toNumber(current.humidity);
  const windSpeed = toNumber(current.windSpeed);
  const visibility = toNumber(current.visibility);
  const uvIndex = toNumber(today?.uvIndex);
  const detailParts: string[] = [];
  let severityScore = 0;

  if (feelsLike !== null) {
    detailParts.push("Feels like " + formatWholeNumber(feelsLike) + "°");
    if (feelsLike >= 32 || feelsLike <= 0) {
      severityScore = Math.max(severityScore, 3);
    } else if (feelsLike >= 28 || feelsLike <= 5) {
      severityScore = Math.max(severityScore, 2);
    }
  }

  if (humidity !== null) {
    detailParts.push("Humidity " + formatWholeNumber(humidity) + "%");
    if (humidity >= 85) {
      severityScore = Math.max(severityScore, 3);
    } else if (humidity >= 70) {
      severityScore = Math.max(severityScore, 2);
    }
  }

  if (windSpeed !== null) {
    detailParts.push("Wind " + formatWholeNumber(windSpeed) + " km/h");
    if (windSpeed >= 40) {
      severityScore = Math.max(severityScore, 3);
    } else if (windSpeed >= 25) {
      severityScore = Math.max(severityScore, 2);
    }
  }

  if (visibility !== null) {
    detailParts.push("Visibility " + formatWholeNumber(visibility) + " km");
    if (visibility <= 2) {
      severityScore = Math.max(severityScore, 3);
    } else if (visibility <= 5) {
      severityScore = Math.max(severityScore, 2);
    }
  }

  if (uvIndex !== null) {
    detailParts.push("UV " + formatWholeNumber(uvIndex));
    if (uvIndex >= 8) {
      severityScore = Math.max(severityScore, 3);
    } else if (uvIndex >= 6) {
      severityScore = Math.max(severityScore, 2);
    }
  }

  if (!detailParts.length) {
    return unavailableCard(
      "comfort-severity",
      "Comfort Severity / 体感压力",
      "Comfort-driving fields are unavailable in the current payload. / 当前响应缺少体感相关字段。"
    );
  }

  const severity: WeatherIntelligenceSeverity =
    severityScore >= 3 ? "high" : severityScore === 2 ? "moderate" : "low";

  return {
    id: "comfort-severity",
    label: "Comfort Severity / 体感压力",
    headline: formatSeverityHeadline(
      "Comfortable window",
      "Mixed comfort",
      "High strain",
      severity
    ),
    summary: formatSeverityHeadline(
      "The current mix looks broadly manageable. / 当前体感整体较平稳。",
      "A few secondary signals may feel noticeable outdoors. / 户外体感会有一些明显波动。",
      "Heat, wind, UV, or low visibility could raise strain outdoors. / 高温、风力、紫外线或低能见度会提高户外负担。",
      severity
    ),
    detail: detailParts.join(" · "),
    severity,
    status: "available",
  };
};

const SEVERE_WEATHER_ICONS = new Set([
  "302",
  "303",
  "304",
  "307",
  "308",
  "310",
  "311",
  "312",
  "313",
  "403",
  "409",
  "804",
  "805",
  "806",
  "807",
]);

const MODERATE_WEATHER_ICONS = new Set([
  "300",
  "301",
  "305",
  "306",
  "309",
  "314",
  "315",
  "400",
  "401",
  "404",
  "405",
  "406",
  "407",
  "456",
  "457",
  "500",
  "501",
  "502",
  "509",
  "511",
  "512",
  "802",
  "803",
]);

const buildWeatherWatchCard = (
  current: CurrentConditions | null,
  today?: DailyForecastPoint
): WeatherIntelligenceCard => {
  if (!current && !today) {
    return unavailableCard(
      "weather-watch",
      "Weather Watch / 天气关注",
      "No normalized condition signal is available. / 缺少可用于判断的天气信号。"
    );
  }

  const textSignals = [current?.text, today?.textDay, today?.textNight]
    .filter((value): value is string => Boolean(value))
    .join(" ");
  const iconSignals = [current?.icon, today?.iconDay, today?.iconNight]
    .filter((value): value is string => Boolean(value));
  const windScale = toNumber(current?.windScale ?? today?.windScaleDay);
  const windSpeed = toNumber(current?.windSpeed);
  const severePattern = /雷|暴雨|暴雪|冰雹|飓风|沙尘暴|storm|hail|hurricane|blizzard|sandstorm|thunder/i;
  const moderatePattern = /雨|雪|雾|霾|风|rain|snow|fog|haze|wind/i;

  let severity: WeatherIntelligenceSeverity = "low";
  if (
    iconSignals.some((icon) => SEVERE_WEATHER_ICONS.has(icon)) ||
    severePattern.test(textSignals) ||
    (windScale !== null && windScale >= 6) ||
    (windSpeed !== null && windSpeed >= 40)
  ) {
    severity = "high";
  } else if (
    iconSignals.some((icon) => MODERATE_WEATHER_ICONS.has(icon)) ||
    moderatePattern.test(textSignals) ||
    (windScale !== null && windScale >= 5) ||
    (windSpeed !== null && windSpeed >= 25)
  ) {
    severity = "moderate";
  }

  const detailParts = [
    current?.text ? "Current " + current.text : null,
    today?.textDay ? "Day " + today.textDay : null,
    windScale !== null ? "Wind scale " + formatWholeNumber(windScale) : null,
  ].filter((value): value is string => Boolean(value));

  return {
    id: "weather-watch",
    label: "Weather Watch / 天气关注",
    headline: formatSeverityHeadline(
      "Stable pattern",
      "Monitor conditions",
      "Watch active",
      severity
    ),
    summary: formatSeverityHeadline(
      "No strong hazard signal stands out in the normalized feed. / 当前标准化信号里没有明显风险提示。",
      "Conditions deserve a quick re-check before heading out. / 出门前值得再确认一次天气变化。",
      "The normalized feed is already surfacing an alert-style signal. / 当前标准化信号已经出现需要重点关注的天气提示。",
      severity
    ),
    detail: detailParts.join(" · ") || "Normalized signal available",
    severity,
    status: "available",
  };
};

export const buildCityWeatherIntelligence = (
  weather: CityWeatherBundle | null
): CityWeatherIntelligence => {
  if (!weather) {
    return {
      cards: [],
    };
  }

  const today = weather.daily[0];

  return {
    cards: [
      buildPrecipitationCard(weather.hourly, today),
      buildTemperatureSwingCard(weather.hourly, today),
      buildDaylightCard(today),
      buildComfortCard(weather.current, today),
      buildWeatherWatchCard(weather.current, today),
    ],
  };
};
