package co.ateunti.services.schedule.tracker;

import co.ateunti.services.schedule.tracker.event.EventService;
import io.helidon.config.Config;
import io.helidon.media.jsonp.JsonpSupport;
import io.helidon.media.multipart.MultiPartSupport;
import io.helidon.webserver.Routing;
import io.helidon.webserver.StaticContentSupport;
import io.helidon.webserver.WebServer;
import io.helidon.webserver.cors.CorsSupport;
import io.helidon.webserver.cors.CrossOriginConfig;

import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.util.logging.Logger;

public final class Main {
  private static final Logger LOGGER = Logger.getLogger(Main.class.getName());

  private Main() {
  }

  public static void main(final String[] args) throws IOException {
    Config config = Config.create();
    WebServer server = WebServer.builder(createRouting(config))
            .config(config.get("server"))
            .addMediaSupport(JsonpSupport.create())
            .addMediaSupport(MultiPartSupport.create())
            .build();

    server.start()
            .thenAccept(ws -> {
              var url = String.format("%s://%s:%d", "http", "localhost", ws.port());
              LOGGER.info("WEB server is up! " + url);
              File htmlFile = new File(url);
              try {
                Desktop.getDesktop().browse(htmlFile.toURI());
              } catch (IOException e) {
                LOGGER.warning(String.format("Cannot open default browser. Please visit %s", url));
              }
              ws.whenShutdown().thenRun(() -> System.out.println("WEB server is DOWN. Good bye!"));
            })
            .exceptionally(t -> {
              System.err.println("Startup failed: " + t.getMessage());
              t.printStackTrace(System.err);
              return null;
            });
  }

  private static Routing createRouting(Config config) throws IOException {
    EventService eventService = new EventService();

    CrossOriginConfig corsConfig = CrossOriginConfig.builder()
            .allowOrigins("*")
            .allowMethods("POST", "GET")
            .build();

    CorsSupport corsSupport = CorsSupport.builder()
            .addCrossOrigin(corsConfig).build();

    return Routing.builder()
            .register("/", StaticContentSupport.builder("WEB")
                    .welcomeFileName("index.html")
                    .build())
            .register("/api/1.0/events", corsSupport, eventService)
            .build();
  }
}
