package dev.bradleysummers.ems;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.sql.DataSource;

@SpringBootApplication
public class EmsApplication implements CommandLineRunner {

	private final DataSource dataSource;

	public EmsApplication(DataSource dataSource) {
		this.dataSource = dataSource;
	}

	public static void main(String[] args) {
		SpringApplication.run(EmsApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		try (var conn = dataSource.getConnection()) {
			System.out.println("✅ Successfully connected to DB: " + conn.getMetaData().getURL());
		}
	}
}

