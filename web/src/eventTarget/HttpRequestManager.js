export class HttpRequestManager {
  static instance = null;
  abortMap = null;
  lockMap = null;
  lockDurationMillis = 10;
  timeoutDuration = 5000;
  contentType = "Content-Type";
  text = "text/plain";
  json = "application/json";

  constructor() {
    this.abortMap = new Map();
    this.lockMap = new Map();
  }

  static getInstance = () => {
    if (!HttpRequestManager.instance) {
      HttpRequestManager.instance = new HttpRequestManager();
    }
    return HttpRequestManager.instance;
  };

  setBasicHeader = (XmlHttpRequest) => {
    XmlHttpRequest.timeout = this.timeoutDuration;
    XmlHttpRequest.onprogress = (ev) =>
      console.log(`Received ${ev.loaded} bytes`, ev);
    // XmlHttpRequest.onerror = (ev) => throw new Error("could not even send");
    XmlHttpRequest.onerror = (ev) => console.log("could not even send", ev);
    XmlHttpRequest.onabort = (ev) => console.log("aborted", ev);
  };

  setLockDurationExtendIfLocked = (url) => {
    const unlockTimer = this.lockMap.get(url);

    if (unlockTimer) {
      clearTimeout(unlockTimer);
      this.lockNextMillis(url);
      return true;
    }

    this.lockNextMillis(url);
    return false;
  };

  lockNextMillis = (url) => {
    const unlockTimer = setTimeout(
      () => this.lockMap.set(url, undefined),
      this.lockDurationMillis,
    );
    this.lockMap.set(url, unlockTimer);
  };

  get = (url, lock = true) => {
    if (lock) {
      if (this.setLockDurationExtendIfLocked(url)) {
        return new Promise((resolve, reject = () => {}) => {
          reject("req already sent");
        });
      }
    }

    return new Promise((resolve, reject) => {
      const hr = new XMLHttpRequest();

      hr.open("GET", url, true);
      this.setBasicHeader(hr);

      hr.onload = () => {
        if (hr.status === 200) {
          const contentType = hr.getResponseHeader(this.contentType);

          if (contentType.includes(this.text)) {
            resolve(hr.response);
            return;
          }

          if (contentType.includes(this.json)) {
            const jsonData = JSON.parse(hr.response);
            resolve(jsonData);
            return;
          }
        }
        reject(hr.status);
      };

      // open connection and send
      hr.send();
    });
  };

  post = (url, data, timeout = 5000, lock = true) => {
    if (lock) {
      if (this.setLockDurationExtendIfLocked(url)) {
        return new Promise((resolve, reject = () => {}) => {
          reject("req already sent");
        });
      }
    }

    return new Promise((resolve, reject) => {
      const hr = new XMLHttpRequest();
      const requestBody = JSON.stringify(data);

      hr.open("POST", url, true);
      hr.setRequestHeader("Content-Type", this.json);
      this.setBasicHeader(hr);

      hr.onload = () => {
        if (hr.status >= 200 && hr.status < 300) {
          resolve(hr.response);
          return;
        }

        reject(hr.status);
      };

      hr.send(requestBody);
    });
  };
}

class HttpRequestWithSignal extends XMLHttpRequest {
  signal = null;
  constructor() {
    super();
  }

  setSignal = (signal) => (this.signal = signal);
  send = () => super.send();
}
