package co.ateunti.services.schedule.tracker.event;

import co.ateunti.services.schedule.tracker.factory.EventFactory;
import co.ateunti.services.schedule.tracker.model.Event;
import io.helidon.common.http.Http;
import io.helidon.media.multipart.ReadableBodyPart;
import io.helidon.media.multipart.ReadableMultiPart;
import io.helidon.webserver.Routing;
import io.helidon.webserver.ServerRequest;
import io.helidon.webserver.ServerResponse;
import io.helidon.webserver.Service;


import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonBuilderFactory;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;


public class EventService implements Service {

  private static final JsonBuilderFactory JSON = Json.createBuilderFactory(Collections.emptyMap());
  private static final Logger LOGGER = Logger.getLogger(EventService.class.getName());
  private final EventLoader eventLoader;
  private final Path storageFile;

  public EventService() throws IOException {
    storageFile = Files.createTempFile("event-service", null);
    eventLoader = new EventLoader();
  }

  private void writeBytes(byte[] bytes) {
    try {
      Files.write(storageFile, bytes,
              StandardOpenOption.CREATE,
              StandardOpenOption.WRITE,
              StandardOpenOption.TRUNCATE_EXISTING);
    } catch (IOException ex) {
      throw new RuntimeException(ex);
    }
  }

  @Override
  public void update(Routing.Rules rules) {
    rules.get("/details", this::getTestEventData)
            .post("/details", this::processEventDetailsFile);
  }

  private void getTestEventData(ServerRequest request, ServerResponse response) {
    JsonArrayBuilder jsonArrayBuilder = JSON.createArrayBuilder();
    List<Event> events = eventLoader.loadEvents();
    EventFactory.buildEventObjects(events).forEach(jsonArrayBuilder::add);
    response.send(jsonArrayBuilder.build());
  }

  private void processEventDetailsFile(ServerRequest request, ServerResponse response) {
    LOGGER.info("Received new request");
    request.content()
            .as(ReadableMultiPart.class)
            .thenAccept(multiPart -> {
              for (ReadableBodyPart part : multiPart.fields("file")) {
                writeBytes(part.as(byte[].class));
              }
              LOGGER.info("File uploaded successfully");
              JsonArrayBuilder jsonArrayBuilder = JSON.createArrayBuilder();
              List<Event> events = eventLoader.loadEvents(storageFile);
              LOGGER.info("Events loaded from temp file");
              EventFactory.buildEventObjects(events).forEach(jsonArrayBuilder::add);
              response.status(Http.Status.OK_200);
              response.send(jsonArrayBuilder.build());
              LOGGER.info("Response sent");

              try {
                Files.delete(storageFile);
                LOGGER.fine("Temp file deleted");
              } catch (IOException e) {
                e.printStackTrace();
              }

            }).exceptionally(x -> {
              x.printStackTrace();
              return null;
            });
  }
}