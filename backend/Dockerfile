# --- Build Aşaması ---
FROM gradle:7.6-jdk17 AS builder
WORKDIR /home/gradle/project

# 1) Önce sadece Gradle yapı betiklerini kopyala (cache için)
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies

# 2) Kaynak kodu al, testleri atlayıp derle
COPY src ./src
RUN ./gradlew --no-daemon build -x test

# --- Runtime Aşaması ---
FROM openjdk:17-jdk-slim
WORKDIR /app
# builder’dan ortaya çıkan jar’ı kopyala
COPY --from=builder /home/gradle/project/build/libs/*.jar app.jar

# Opsiyonel: Daha iyi GC ve hafıza yönetimi için Java opsiyonları
ENV JAVA_OPTS="-Xms256m -Xmx512m"
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
