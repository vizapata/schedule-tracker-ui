package co.ateunti.services.schedule.tracker.event;

import co.ateunti.services.schedule.tracker.model.Event;
import co.ateunti.services.schedule.tracker.model.EventType;
import co.ateunti.services.schedule.tracker.model.Person;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;

import java.io.FileInputStream;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.LinkedList;
import java.util.List;

public class EventLoader {
  private static final String FILE_NAME = "test-file.xls";
  private static final String EXIT_TOKEN = "salida";

  public List<Event> loadEvents() {
    return this.loadEvents(Path.of(FILE_NAME));
  }

  public List<Event> loadEvents(Path filePath) {
    List<Event> events = new LinkedList<>();
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    try (var eventsFile = new FileInputStream(filePath.toFile());
         var workbook = new HSSFWorkbook(eventsFile);) {
      Sheet datatypeSheet = workbook.getSheetAt(0);
      boolean headerSkip = true, titleSkip = true;
      for (Row currentRow : datatypeSheet) {
        if (headerSkip) {
          headerSkip = false;
          continue;
        }
        if (titleSkip) {
          titleSkip = false;
          continue;
        }

        String id = currentRow.getCell(0).getStringCellValue();
        if (id.isBlank()) break;

        Event event = new Event();
        Person person = new Person();

        event.setEventId(Long.parseLong(id));
        event.setDate(sdf.parse(currentRow.getCell(1).getStringCellValue()));
        event.setDeviceName(currentRow.getCell(2).getStringCellValue());
        event.setEventType(currentRow.getCell(3).getStringCellValue().toLowerCase().contains(EXIT_TOKEN) ? EventType.EXIT : EventType.ENTRANCE);
        event.setEventDescription(currentRow.getCell(4).getStringCellValue());
        event.setReaderName(currentRow.getCell(10).getStringCellValue());
        event.setVerificationMode(currentRow.getCell(11).getStringCellValue());
        event.setNotes(currentRow.getCell(13).getStringCellValue());

        person.setId(currentRow.getCell(5).getStringCellValue());
        person.setFirstName(currentRow.getCell(6).getStringCellValue());
        person.setLastName(currentRow.getCell(7).getStringCellValue());
        person.setCard(currentRow.getCell(8).getStringCellValue());
        person.setDepartment(currentRow.getCell(9).getStringCellValue());
        person.setArea(currentRow.getCell(12).getStringCellValue());

        event.setPerson(person);
        events.add(event);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return events;
  }

}
