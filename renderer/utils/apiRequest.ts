async function handleError(res: Response) {
  if (!res.ok) {
    console.log("Error making API request \n", res.statusText);
    throw new Error(`${res.statusText}`);
  }
}

const defaultGetOptions: RequestInit = { next: { revalidate: 60 } };
const baseUrl = 'http://localhost:3000'

export async function apiGetRequest(
  endpoint: string,
  options: RequestInit = {}
) {

  try {
    // console.log("GET REQUEST")
    // console.log(baseUrl + endpoint, `\nOptions${options}`)
    options = Object.assign({}, defaultGetOptions, options);


    const res = await fetch(baseUrl + endpoint, {
      ...options,
    });

    await handleError(res);
    const json = await res.json();
    return json
  } catch (e) {
    console.log(e)
  }
}

export async function apiPostRequest(
  endpoint: string,
  body: any,
  options: RequestInit = {}
) {

  // console.log("POST REQUEST", endpoint)
  // console.log(`\n::: _POST_ ::: ${baseUrl} : ${endpoint} :::\n`, body);
  const res = await fetch(baseUrl + endpoint, {
    method: "POST",
    body,
    ...options,
  });

  // Recommendation: handle errors
  await handleError(res);

  return res.json();
}

export async function apiMethodRequest(
  endpoint: string,
  method = "POST",
  body: Record<string, any> | undefined,
  options: RequestInit = { next: { revalidate: 30 } }
) {

  try {
    // console.log(`\n::: ${method} ::: ${endpoint} :::\n`, body);
    const res = await fetch(baseUrl + endpoint, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
    await handleError(res);

    const json = await res.json();
    return json
  } catch (e) {
    console.log(`FAILED:::\n::: ${method} ::: ${endpoint} :::\n`, body);
    console.log(e)
  }
}
