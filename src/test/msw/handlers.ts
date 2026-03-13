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
          tz: "Asia/Shanghai",
          lat: "39.90499",
          lon: "116.40529",
        },
      ],
    });
  }),
];

