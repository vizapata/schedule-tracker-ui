# Please note that this makefile is intented to be run under Windows. Moreover under the X64 Native Tools Command Prompt for Visual Studio
.PHONY: prep build rm clean

prep:
	mkdir %cd%\api\target
	mkdir %cd%\api\src\main\resources\WEB

build:
	cd ui && npm install && npm run release && copy /y dist\ng-starter-template ..\api\src\main\resources\WEB\ && cd ..
	mvn package -Pnative-image -DskipTests -Dnative.image.buildStatic

rm:
	rmdir /q /s %cd%\api\src\main\resources\WEB
	rmdir /q /s %cd%\api\target

clean:
	mvn clean
	rmdir /q /s %cd%\ui\dist

default: build
