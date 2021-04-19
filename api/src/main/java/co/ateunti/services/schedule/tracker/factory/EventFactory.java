package co.ateunti.services.schedule.tracker.factory;


import co.ateunti.services.schedule.tracker.model.Event;
import co.ateunti.services.schedule.tracker.model.Person;

import javax.json.Json;
import javax.json.JsonBuilderFactory;
import javax.json.JsonObject;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class EventFactory {
  private static final JsonBuilderFactory JSON = Json.createBuilderFactory(Collections.emptyMap());

  public static List<JsonObject> buildEventObjects(List<Event> events) {
    return events.stream().map(EventFactory::buildEventObject).collect(Collectors.toList());
  }

  public static JsonObject buildEventObject(Event event) {
    return JSON.createObjectBuilder()
            .add("id", event.getEventId())
            .add("date", event.getDate().getTime())
            .add("deviceName", event.getDeviceName())
            .add("eventType", event.getEventType().name())
            .add("eventDescription", event.getEventDescription())
            .add("person", buildPersonObject(event.getPerson()))
            .add("verificationMode", event.getVerificationMode())
            .add("readerName", event.getReaderName())
            .add("notes", event.getNotes())
            .build();
  }

  private static JsonObject buildPersonObject(Person person) {
    return JSON.createObjectBuilder()
            .add("id", person.getId())
            .add("area", person.getArea())
            .add("card", person.getCard())
            .add("department", person.getDepartment())
            .add("firstName", person.getFirstName())
            .add("lastName", person.getLastName())
            .build();
  }
}
