package co.ateunti.services.schedule.tracker.model;

import java.util.Date;


public class Event {
  private Long eventId;
  private Date date;
  private String deviceName;
  private EventType eventType;
  private String eventDescription;
  private Person person;
  private String readerName;
  private String verificationMode;
  private String notes;

  public Long getEventId() {
    return eventId;
  }

  public void setEventId(Long eventId) {
    this.eventId = eventId;
  }

  public Date getDate() {
    return date;
  }

  public void setDate(Date date) {
    this.date = date;
  }

  public String getDeviceName() {
    return deviceName;
  }

  public void setDeviceName(String deviceName) {
    this.deviceName = deviceName;
  }

  public EventType getEventType() {
    return eventType;
  }

  public void setEventType(EventType eventType) {
    this.eventType = eventType;
  }

  public String getEventDescription() {
    return eventDescription;
  }

  public void setEventDescription(String eventDescription) {
    this.eventDescription = eventDescription;
  }

  public Person getPerson() {
    return person;
  }

  public void setPerson(Person person) {
    this.person = person;
  }

  public String getReaderName() {
    return readerName;
  }

  public void setReaderName(String readerName) {
    this.readerName = readerName;
  }

  public String getVerificationMode() {
    return verificationMode;
  }

  public void setVerificationMode(String verificationMode) {
    this.verificationMode = verificationMode;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }

  @Override
  public String toString() {
    return "Event{" +
            "eventId=" + eventId +
            ", date=" + date +
            ", deviceName='" + deviceName + '\'' +
            ", eventType=" + eventType +
            ", eventDescription='" + eventDescription + '\'' +
            ", person=" + person +
            ", readerName='" + readerName + '\'' +
            ", verificationMode='" + verificationMode + '\'' +
            ", notes='" + notes + '\'' +
            '}';
  }
}
