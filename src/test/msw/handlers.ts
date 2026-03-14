import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://mock-api.qweather.test/geo/v2/city/lookup", ({ request }) => {
    const url = new URL(request.url);
    const location = url.searchParams.get("location");

    if (location === "Invalid Host") {
      return HttpResponse.json(
        {
          error: {
            status: 403,
            title: "Invalid Host",
            detail: "An invalid or unauthorized API Host.",
          },
        },
        { status: 403 }
      );
    }

    return HttpResponse.json({
      code: "200",
      location: [
        {
          id: "101010100",
          name: "北京",
          adm1: "北京市",
          adm2: "北京",
          country: "中国",
          countryCode: "CN",
          tz: "Asia/Shanghai",
          lat: "39.90499",
          lon: "116.40529",
          adcode: "110000",
        },
      ],
    });
  }),
  http.get("https://mock-api.qweather.test/v7/weather/now", () =>
    HttpResponse.json({
      code: "200",
      now: {
        obsTime: "2026-03-13T12:00+08:00",
        temp: "23",
        feelsLike: "22",
        text: "晴",
        icon: "100",
        humidity: "26",
        windDir: "北风",
        windScale: "3",
        windSpeed: "11",
        pressure: "1015",
        vis: "20",
      },
    })
  ),
  http.get("https://mock-api.qweather.test/v7/weather/24h", () =>
    HttpResponse.json({
      code: "200",
      hourly: Array.from({ length: 8 }, (_, index) => ({
        fxTime: `2026-03-13T${String(8 + index).padStart(2, "0")}:00+08:00`,
        temp: `${18 + index}`,
        text: index % 2 === 0 ? "晴" : "多云",
        icon: index % 2 === 0 ? "100" : "101",
        pop: `${index * 5}`,
        windDir: "北风",
        windScale: "3",
      })),
    })
  ),
  http.get("https://mock-api.qweather.test/v7/weather/7d", () =>
    HttpResponse.json({
      code: "200",
      daily: [
        {
          fxDate: "2026-03-13",
          tempMax: "24",
          tempMin: "13",
          textDay: "晴",
          textNight: "多云",
          iconDay: "100",
          iconNight: "101",
          windDirDay: "北风",
          windScaleDay: "3",
          humidity: "35",
          precip: "0.0",
        },
        {
          fxDate: "2026-03-14",
          tempMax: "25",
          tempMin: "14",
          textDay: "多云",
          textNight: "晴",
          iconDay: "101",
          iconNight: "150",
          windDirDay: "北风",
          windScaleDay: "3",
          humidity: "39",
          precip: "0.2",
        },
      ],
    })
  ),
  http.get("https://mock-api.qweather.test/v7/air/now", () =>
    HttpResponse.json({
      code: "200",
      now: {
        aqi: "42",
        category: "优",
        primary: "PM2.5",
        pm2p5: "12",
        pm10: "21",
        no2: "9",
        so2: "4",
        co: "0.5",
        o3: "52",
      },
    })
  ),
  http.get("https://mock-api.qweather.test/v7/historical/weather", ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get("date") ?? "20260313";
    const fxDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

    return HttpResponse.json({
      code: "200",
      weatherDaily: {
        fxDate,
        tempMax: "24",
        tempMin: "14",
        humidity: "41",
        precip: "1.2",
        textDay: "晴",
        iconDay: "100",
        windSpeedDay: "15",
      },
      weatherHourly: [
        {
          fxTime: `${fxDate}T08:00+08:00`,
          temp: "18",
          humidity: "50",
          precip: "0.0",
          windSpeed: "10",
          text: "晴",
          icon: "100",
        },
        {
          fxTime: `${fxDate}T14:00+08:00`,
          temp: "24",
          humidity: "35",
          precip: "1.2",
          windSpeed: "15",
          text: "晴",
          icon: "100",
        },
      ],
    });
  }),
];
