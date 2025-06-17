export default class Config {
  static API_URL = 'https://c750-105-172-47-207.ngrok-free.app/';
  
  static APP_NAME = 'MeuApp';
  
  static API_URL_WS = 'c750-105-172-47-207.ngrok-free.app';
  
  static API_MEDIA_URL = 'https://c750-105-172-47-207.ngrok-free.app';
  
  static getApiUrlMedia() {
    return this.API_MEDIA_URL;
  }
  
  static getApiUrl() {
    return this.API_URL;
  }
  
  static getApiUrlWs() {
    return this.API_URL_WS;
  }
}
