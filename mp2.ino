#include <TinyGPS++.h>
#include <PulseSensorPlayground.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

#define TOUCH_PIN 14
#define IR_PIN 27
#define PULSE_PIN 34

const char* ssid = "Pranavi's realme";
const char* password = "xyz@1234";

const char* serverURL =
"https://exclude-simmering-agency.ngrok-free.dev/alerts/api/incoming";

// GSM Contacts
String registeredContacts[2] = {
  "+919391615969",
  "+919100888528"
};

String emergencyContacts[2] = {
  "+919347066933",
  "+918919628266"
};

// GSM Serial
HardwareSerial gsm(2);

// GPS Serial
HardwareSerial gpsSerial(1);

TinyGPSPlus gps;
PulseSensorPlayground pulseSensor;

// Variables
unsigned long touchStartTime = 0;

bool touchActive = false;
bool alert5Sent = false;
bool alert10Sent = false;

int lastPulse = 0;

float latitude = 0.0;
float longitude = 0.0;

// ======================
// SEND SMS
// ======================
void sendSMS(String number, String message) {

  gsm.println("AT+CMGF=1");
  delay(500);

  gsm.print("AT+CMGS=\"");
  gsm.print(number);
  gsm.println("\"");

  delay(500);

  gsm.print(message);

  delay(500);

  gsm.write(26);

  delay(3000);
}

// ======================
// SEND TO REGISTERED
// ======================
void sendToRegistered(String msg) {

  for (int i = 0; i < 2; i++) {
    sendSMS(registeredContacts[i], msg);
  }
}

// ======================
// SEND TO ALL
// ======================
void sendToAll(String msg) {

  sendToRegistered(msg);

  for (int i = 0; i < 2; i++) {
    sendSMS(emergencyContacts[i], msg);
  }
}

// ======================
// LOCATION LINK
// ======================
String getLocation() {

  if (gps.location.isValid()) {

    return "https://maps.google.com/?q=" +
           String(latitude, 6) +
           "," +
           String(longitude, 6);
  }

  return "Location Not Available";
}

// ======================
// SEND ALERT TO DASHBOARD
// ======================
void sendDashboardAlert(
  String type,
  String description
) {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi Disconnected");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;

  http.begin(client,serverURL);

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  String jsonData =
    "{"
    "\"type\":\"" + type + "\","
    "\"latitude\":""\"17.2913\","
    "\"longitude\":" "\"78.5303\","
    "\"deviceId\":\"ESP32-WOMEN-SAFETY\","
    "\"description\":\"" + description + "\""
    "}";

 Serial.println("Sending Request...");
Serial.println(serverURL);
Serial.println(jsonData);

int responseCode = http.POST(jsonData);
if(responseCode<0){
  Serial.print("Http Error:");
  Serial.println(http.errorToString(responseCode));
}
Serial.print("Response Code: ");
Serial.println(responseCode);

if(responseCode > 0){
    String response = http.getString();
    Serial.println(response);
}

  http.end();
}

// ======================
// SETUP
// ======================
void setup() {

  Serial.begin(9600);

  // GSM
  gsm.begin(9600, SERIAL_8N1, 16, 17);

  // GPS
  gpsSerial.begin(9600, SERIAL_8N1, 4, 5);

  pinMode(TOUCH_PIN, INPUT);
  pinMode(IR_PIN, INPUT);

  pulseSensor.analogInput(PULSE_PIN);
  pulseSensor.begin();

  // WiFi
  WiFi.begin(ssid, password);

  Serial.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected");

  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  latitude = 17.2913;
  longitude = 78.5303;
  Serial.println("System Initialized");
}

// ======================
// LOOP
// ======================
void loop() {

  // GPS Update
 

  // ======================
  // TOUCH SENSOR
  // ======================
  if (digitalRead(TOUCH_PIN) == HIGH) {
    if (!touchActive) {
      touchActive = true;
      touchStartTime = millis();
    }

    unsigned long duration = millis() - touchStartTime;

    // Touch ≥ 5 seconds → alert registered contacts
    if (duration >= 5000 && !alert5Sent) {
      Serial.println("Touch sensor triggered for 5 seconds");
      sendToRegistered("Manual Trigger (EMERGENCY)");
      Serial.println("Manual Trigger (EMERGENCY)"+getLocation());
      alert5Sent = true;
    }

    // Touch ≥ 10 seconds → alert all contacts with GPS
    if (duration >= 10000 && !alert10Sent) {
      Serial.println("Touch sensor triggered for 10 seconds");
      sendToAll("Manual Trigger (EMERGENCY)\n");
      Serial.println("Manual Trigger (EMERGENCY)\n"+getLocation());
      alert10Sent = true;
    }

  } else {
    // Reset when touch is released
    touchActive = false;
    alert5Sent = false;
    alert10Sent = false;
  }
  if (digitalRead(TOUCH_PIN) == HIGH) {

    if (!touchActive) {

      touchActive = true;
      touchStartTime = millis();
    }

    unsigned long duration =
      millis() - touchStartTime;

    // 5 Seconds
    if (duration >= 5000 &&
        !alert5Sent) {

      String msg =
        "SOS Triggered\n" +
        getLocation();

      sendToRegistered(msg);

      sendDashboardAlert(
        "manual_trigger",
        "SOS Button Pressed (5 sec)"
      );

      alert5Sent = true;
    }

    // 10 Seconds
    if (duration >= 10000 &&
        !alert10Sent) {

      String msg =
        "EMERGENCY ALERT\n" +
        getLocation();

      sendToAll(msg);

      sendDashboardAlert(
        "manual_trigger",
        "SOS Button Pressed (10 sec)"
      );

      alert10Sent = true;
    }

  } else {

    touchActive = false;
    alert5Sent = false;
    alert10Sent = false;
  }

  // ======================
  // PULSE SENSOR
  // ======================
  int pulse =
    pulseSensor.getBeatsPerMinute();

  if (pulse > 0) {

    Serial.print("Pulse: ");
    Serial.println(pulse);
  }

  if (pulse > 0 &&
      abs(pulse - lastPulse) > 30) {

    String msg =
      "Pulse Fluctuation Detected\n" +
      getLocation();

    sendToAll(msg);

    sendDashboardAlert(
      "combined_danger",
      "Abnormal Heart Rate"
    );
  }

  lastPulse = pulse;

  // ======================
  // IR + TOUCH
  // ======================
  if (digitalRead(IR_PIN) == HIGH &&
      touchActive) {

    String msg =
      "DANGER ALERT\nMultiple Triggers\n" +
      getLocation();

    sendToAll(msg);

    sendDashboardAlert(
      "combined_danger",
      "IR + Touch Triggered"
    );

    delay(5000);
  }

  delay(500);
}