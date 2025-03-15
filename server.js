const express = require("express");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { exec } = require("child_process");
const cors = require("cors");
const fetch = require("node-fetch");
const qs = require("qs");

const app = express();
const port = 3000; // You can change this to any port you prefer

const token = process.env.bottoken;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.options("*", cors()); // Enable CORS preflight for all routes
let cookie = process.env.cookie; //authentication for instagram account
let xtoken = process.env.xctoken;
app.get("/", (req, res) => {
  res.send("use post request to endpoints");
});



app.post("/note", (req, res) => {
  getquote().then((quote) => {
    postnote(quote).then((result) => {
      res.send(result);
    });
  });
});

app.post("/story", (req, res) => {
  //console.log(req);
  let number = Math.floor(Math.random() * 2) + 1;
  if (number == 1) {
    scorrelate(1).then((imglink) => {
      //console.log(imglink);
      const curlCommand = `curl "${imglink}" --output books.txt`;

      exec(curlCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing curl: ${error.message}`);
          return;
        }

        if (stderr) {
          //console.error(`stderr: ${stderr}`);
          //return;
        }

        //console.log(`Response: ${stdout}`);
        fs.readFile("books.txt", (err, data) => {
          //console.log(data);
          postimg(data).then((response) => {
            console.log(response.upload_id);
            configimg(response.upload_id).then((result) => {
              res.status(201).end();
            });
          });
        });
      });
    });
  } else if (number == 2) {
    picture().then((imglink) => {
      //console.log(imglink);
      const curlCommand = `curl "${imglink}" --output books.txt`;

      exec(curlCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing curl: ${error.message}`);
          return;
        }

        if (stderr) {
          //console.error(`stderr: ${stderr}`);
          //return;
        }

        //console.log(`Response: ${stdout}`);
        fs.readFile("books.txt", (err, data) => {
          //console.log(data);
          postimg(data).then((response) => {
            console.log(response.upload_id);
            configimg(response.upload_id).then((result) => {
              res.status(201).end();
            });
          });
        });
      });
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
function postnote(note) {
  let data = qs.stringify({
    fb_api_caller_class: " RelayModern",
    fb_api_req_friendly_name: " usePolarisCreateInboxTrayItemSubmitMutation",//include actor id below from header params
    variables: `{"input":{"client_mutation_id":"1","actor_id":"","additional_params":{"note_create_params":{"note_style":0,"text":"${note}"}},"audience":0,"inbox_tray_item_type":"note"}}`,
    doc_id: "",//your document id from instagram request header params
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://www.instagram.com/graphql/query",
    headers: {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded",
      cookie: cookie,
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "x-csrftoken": xtoken,
    },
    data: data,
  };

  return axios
    .request(config)
    .then((response) => {
      if (response.data.data == null) {
        reporterror(String(response.data), "postnote");
      }
      return JSON.stringify(response.data);Ω
    })
    .catch((error) => {
      console.log(error);
      reporterror(String(error), "postnote");
    });
}
function getquote() {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://zenquotes.io/api/random",
    headers: {},
  };

  return axios
    .request(config)
    .then((response) => {
      let quote = response.data[0].q + " -- " + response.data[0].a;
      return String(quote);
    })
    .catch((error) => {
      console.log(error);
    });
}
function postimg(imgdata) {
  //console.log(imgdata)
  const timestamp = String(Date.now());
  //console.log(timestamp);

  let params = {
    media_type: 1,
    upload_id: timestamp,
    upload_media_height: 2532,
    upload_media_width: 1170,
  };
  var headers = {
    Cookie: cookie,
    "user-agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "x-asbd-id": "129477",
    "x-entity-length": "23",
    "x-entity-name": `fb_uploader_${timestamp}`,
    "x-entity-type": "image/jpeg",
    "x-ig-app-id": "1217981644879628",
    "x-instagram-ajax": "1019148426",
    "x-instagram-rupload-params": JSON.stringify(params),
    "x-web-session-id": "qgygh6:p79ymd:k35fqi",
    "Content-Type": "image/png",
    Origin: "https://www.instagram.com",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Cache-Control": "no-cache",
    Offset: "0",
  };
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `https://i.instagram.com/rupload_igphoto/fb_uploader_${timestamp}`,
    headers: headers,
    data: imgdata,
  };
  return axios
    .request(config)
    .then((response) => {
      //console.log(response.data)
      return response.data;
    })
    .catch((error) => {
      console.log(error.response.data);
      reporterror(String(error.response.data), "postimg");
    });
}

function getimagedata(imgurl) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: imgurl,
  };

  return axios
    .request(config)
    .then((response) => {
      return response.data;
      //console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
}

function configimg(id) {
  const form = new FormData();
  form.append("upload_id", String(id));
  let headers = {
    Cookie: cookie,
    "user-agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "x-asbd-id": "129477",
    "x-csrftoken": xtoken, //might need changing every so often
    "x-ig-app-id": "1217981644879628",
    "x-ig-www-claim": "hmac.AR2Bt4B13YYMf8BE7ObvNdojIw0T1m-qTGQR-XKW1EBZD7zK",
    "x-instagram-ajax": "1019148426",
    "x-requested-with": "XMLHttpRequest",
    "x-web-session-id": "qgygh6:p79ymd:k35fqi",
  };
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://www.instagram.com/api/v1/web/create/configure_to_story/",
    headers: headers,
    data: form,
  };
  return axios
    .request(config)
    .then((response) => {
      if (response.data) {
        reporterror(String(response.data), "configpost");
      }
      return response.data;
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error.response.data);
      reporterror(String(error.response.data), "configpost");
    });
}

function scorrelate(number) {
  if (number == 1) {
    return fetch("https://tylervigen.com/spurious/random", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        cookie:
          "last_squiggliness=2; recent_variables=%5B1307%2C1570%2C1307%2C1570%2C25171%2C1402%5D; recent_categories=%5B%22education%22%2C%22stocks%22%2C%22education%22%2C%22stocks%22%2C%22memes%22%2C%22google%22%5D; last_chart_shape=4; last_number_of_years=18; last_correlation=0.9577; num_viewed=24",
        Referer: "https://tylervigen.com/spurious-correlations",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
      redirect: "follow",
      follow: 10,
    }).then((response) => {
      let x = response.url.split(
        "https://tylervigen.com/spurious/correlation/"
      );
      var newurl =
        "https://tylervigen.com/spurious/correlation/image/" + x[1] + ".png";
      //console.log(newurl);
      return newurl;
    });
  }
}
function picture() {
  let url = "https://picsum.photos/1170/2532";
  let random = Math.floor(Math.random() * 20) + 1;
  if (random % 4 == 0) {
    url += "?grayscale";
  } else if (random % 6 == 0) {
    url += "?blur";
  }
  return fetch(url, {
    body: null,
    method: "GET",
    redirect: "follow",
    follow: 10,
  }).then((response) => {
    return response.url;
  });
}
function getbinaryimg(imgurl) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: imgurl,
    headers: {},
  };

  return axios
    .request(config)
    .then((response) => {
      //console.log(JSON.stringify(response.data));
      //console.log(response.data)
      const buffer = Buffer.from(response.data);
      return buffer;
    })
    .catch((error) => {
      console.log(error);
    });
}
