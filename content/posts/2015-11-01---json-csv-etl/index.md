---
title: 如何将JSON, Text, XML, CSV数据文件导入MySQL
date: "2015-01-01T02:33:32.217Z"
template: post
draft: false
category: "bigdata"
tags:
  - "technical"
  - "BigData"
  - "ETL"
  - "MySQL"
  - "XML"
  - "JSON"
description: "How to ETL -- JSON, Text, XML, CSV"
---

**文/freenik**

将外部数据导入(import)数据库是在数据库应用中一个很常见的需求。其实这就是在数据的管理和操作中的[ETL (Extract, transform, load)](https://en.wikipedia.org/wiki/Extract,_transform,_load)的L (Load)部分，也就是说，将特定结构(structure)或者格式(format)的数据导入某个目的地(比如数据库，这里我们讨论MySQL)。

![ETL Process](https://upload-images.jianshu.io/upload_images/72299-64cc20c0f1bfc678.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

本文要讨论的内容，是如何方便地将多种格式(JSON, Text, XML, CSV)的数据导入MySQL之中。

**本文大纲**：

1. 将Text文件（包括CSV文件）导入MySQL
2. 将XML文件导入MySQL
3. 将JSON文件导入MySQL
4. 使用MySQL workbench的Table Data Export and Import Wizard进行JSON或CSV文件的导入导出

# 1. 将Text文件（包括CSV文件）导入MySQL
这里我们的讨论是基于一个假定，Text file和CSV file是有着比较规范的格式的(properly formatted)，比如说每行的每个数据域(field)之间是由一个共同的分隔符（比如tab: `\t`）分隔的。

那么首先，你需要根据你的数据的格式（有哪些域），来设计好数据库的对应的表 （的Schema）。

举个例子，要处理的Text文件或者CSV文件是以`\t`作为分隔符的，每行有id, name, balance这么三个数据域，那么首先我们需要在数据库中创建这个表：

```sql
CREATE TABLE sometable(id INT, name VARCHAR(255), balance DECIMAL(8,4));
```

创建成功以后就可以导入了。操作方式很简单：

```sql
LOAD DATA LOCAL INFILE '你的文件路径（如~/file.csv）'  INTO TABLE sometable FIELDS TERMINATED BY '\t' [ENCLOSED BY '"'(可选)] LINES TERMINATED BY '\n' (id, name, balance)
```

这里要注意的是，我们需要开启**local-infile**这个MySQL的配置参数，才能够成功导入。究其原因，从MySQL的Manual中可以看到这么一段话：

>LOCAL works only if your server and your client both have been configured to permit it. For example, if mysqld was started with --local-infile=0, LOCAL does not work. See Section 6.1.6, “Security Issues with LOAD DATA LOCAL”.

这是MySQL出于安全考虑的默认配置。因此，我们需要在配置文件**my.cnf**中（以Debian发行版的Linux, 如Ubuntu为例， 即是在/etc/my.cnf中），确保：

`local-infile=1`

抑或是在命令行启动MySQL时加上**--local-infile**这一项：

```bash
mysql --local-infile -uroot -pyourpwd yourdbname
```

此外，我们也可以使用MySQL的一个官方导入程序[**mysqlimport** ](https://dev.mysql.com/doc/refman/5.7/en/mysqlimport.html)，这个程序本质上就是为LOAD DATA FILE提供了一个命令行的interface，很容易理解，我们这里就不再详述。

# 2. 将XML文件导入MySQL
这件事的完成方式，与我们的XML的形式有着很大的关系。

举个例子说，当你的XML数据文件有着很非常规范的格式，比如：
```xml
    <?xml version="1.0"?>
      <row>
        <field name="id">1</field>
        <field name="name">Free</field>
        <field name="balance">2333.3333</field>
       </row>

      <row>
        <field name="id">2</field>
        <field name="name">Niki</field>
        <field name="balance">1289.2333</field>
      </row>
```
或者
```xml
    <row column1="value1" column2="value2" .../>
```
我们就可以很方便使用`LOAD XML`来导入，这里可以参见MySQL的官方手册--[LOAD XML Syntax](https://dev.mysql.com/doc/refman/5.5/en/load-xml.html)。

然而我们可能有另外一些需求，比如说，我们可能会想要将XML文件的域映射到不同名字的列(TABLE COLUMN)之中。这里要注意，MySQL v5.0.7以后，MySQL的Stored Procedure中不能再运行`LOAD XML INFILE` 或者`LOAD DATA INFILE`。所以转换的程序(procedure)的编写方式与在此之前有所不同。这里，我们需要使用` Load_File()`和`ExtractValue()`这两个函数。

以下是一个示例XML文件和程序：
文件：
```xml
    <?xml version="1.0"?>
	<some_list>
	  <someone id="1" fname="Rob" lname="Gravelle"/>
	  <someone id="2" fname="Al" lname="Bundy"/>
	  <someone id="3" fname="Little" lname="Richard"/>
	</some_list>
```
程序：
```sql
    DELIMITER $$
    CREATE DEFINER=`root`@`localhost` PROCEDURE `import_some_xml`(path varchar(255), node varchar(255))
    BEGIN
        declare xml_content text;
        declare v_row_index int unsigned default 0;
        declare v_row_count int unsigned;
        declare v_xpath_row varchar(255);

        set xml_content = load_file(path);

        -- calculate the number of row elements.
        set v_row_count  = extractValue(xml_content, concat('count(', node, ')'));

        -- loop through all the row elements
        while v_row_index < v_row_count do
            set v_row_index = v_row_index + 1;
            set v_xpath_row = concat(node, '[', v_row_index, ']/@*');
            insert into applicants values (
                extractValue(xml_content, concat(v_xpath_row, '[1]')),
                extractValue(xml_content, concat(v_xpath_row, '[2]')),
                extractValue(xml_content, concat(v_xpath_row, '[3]'))
            );
        end while;
    END
```
在MySQL中，使用它进行导入：

`call import_some_xml('你的XML文件路径', '/some_list/someone');`

程序相当的直白，只要了解一下MySQL的脚本编写即可。

这里提一下`DELIMITER $$`。我们知道MySQL的命令分隔符默认为分号，然而脚本中很显然是有分号的，但是我们并不希望立即执行，所以我们需要临时更改分隔符。

# 3. 将JSON文件导入MySQL
如何将JSON文件导入MySQL中，是一个很有趣的话题。JSON是一种现在相当常用的文件结构，所以掌握它的导入具有比较广泛的意义。

很多时候，我们处理的JSON数据是以如下形式出现的：
```json
	{"name":"Julia","gender":"female"}
	{"name":"Alice","gender":"female"}
	{"name":"Bob","gender":"male"}
	{"name":"Julian","gender":"male"}
```
而并不是规整的`[{},{},{},{}]`（一些NoSQL数据库的Export）。

这样的形势对于载入有一个好处：因为每一行是一个JSON Object，所以我们便可以按行处理此文件，而不需要因为JSON的严格结构将整个文件（比如一个许多G的.json文件）全部载入。

## 方式一 使用common-schema
[common-schema](https://code.google.com/p/common-schema/)是一个应用很广泛的MySQL的框架，它有着很丰富的功能和详细的[文档](https://common-schema.googlecode.com/svn/trunk/common_schema/doc/html/introduction.html)。我们可以使用它的JSON解析的功能。（它还具有JSON转换成XML等等方便的功能）

具体说来，将common-schema导入之后，使用它的`extract_json_value`函数即可。源码中：
```sql
	create function extract_json_value(
	    json_text text charset utf8,
	    xpath text charset utf8
	) returns text charset utf8
```
该函数接受两个参数，一个是json_text，表示json文件的内容，另一个是xpath，表示数据的结构（这里可以类比XML文件的处理）。很多读者应该知道，[XPath](https://developer.mozilla.org/en-US/docs/Web/XPath)是用来对XML中的元素进行定位的，这里也可以作一样的理解。

以本段开始的几行JSON为例，这里common-schema的使用如下例：
```sql
	select common_schema.extract_json_value(f.event_data,'/name') as name, common_schema.extract_json_value(f.event_data,'/gender') as gender, sum(f.event_count) as event_count from json_event_fact f group by name, gender;
```
关于event_data，我们需要先理解LOAD DATA INFILE是一个[event](https://dev.mysql.com/doc/internals/en/load-data-infile-events.html)，不同的event type对应不同的event data。这部分知识可以参看[Event Data for Specific Event Types](https://dev.mysql.com/doc/internals/en/event-data-for-specific-event-types.html)

如果感兴趣，可以参看其[源码](https://common-schema.googlecode.com/files/common_schema-2.2.sql)。参看一个受到广泛使用的项目的源码，对于自身成长是很有益的。

当然了，我们也可以像之前处理XML文件导入一样，自己编写程序。这里便不再给出实例程序，有兴趣的读者可以自行编写或者跟笔者交流。

## 方式二 使用mysqljsonimport
这是[Anders Karlsson](https://plus.google.com/107634974697175275751)的一个完成度很高的作品。这一份程序由C写成。它依赖于一个JSON Parser，[Jansson](https://www.digip.org/jansson/)。他们都有着比较好的维护和[文档](https://jansson.readthedocs.org/en/2.7/tutorial.html)，所以使用上体验很好。

mysqljsonimport的下载在[SourceForge](https://sourceforge.net/projects/mysqljson/)上。具体使用参照其文档即可。

为了方便不熟悉源码安装的朋友，笔者在这里提一下安装流程和注意事项。
安装命令顺序如下：

	$ wget https://sourceforge.net/projects/mysqljson/files/myjsonimport_1.6/mysqljsonimport-1.6.tar.gz
	$ tar xvfz mysqljsonimport-1.6.tar.gz
	$ cd mysqljsonimport-1.6
	$ ./configure –-with-mysql=/xxx/mysql
	$ make
	$ make check
	$ sudo make install

`--with-mysql`这一步不是必要的，只要你安装的mysql的路径是系统的默认路径。很关键的，而且很容易被不熟悉的朋友忽略的是，这一个C程序要成功编译和运行，是需要MySQL的C API的，所以需要安装的依赖，除了**jansson**，还有**libmysqlclient-dev**。

[jansson的安装](https://jansson.readthedocs.org/en/2.6/gettingstarted.html#compiling-and-installing-jansson)就是简单的源码安装，**libmysqlclient-dev**则可以使用包管理工具(比如ubuntu中使用apt-get即可；编译和安装前，建议先`sudo apt-get update`以避免不必要的麻烦)。

导入命令：

	$ ./mysqljsonimport –-database test –-table tablename jsonfilename

还有一个parser，作者是Kazuho，感兴趣的读者可以参看一下，他的相关博文是[mysql_json - a MySQL UDF for parsing JSON ](https://blog.kazuhooku.com/2011/09/mysqljson-mysql-udf-for-parsing-json.html)，github项目是**[mysql_json](https://github.com/kazuho/mysql_json)**。

# 4. 使用MySQL workbench
Workbench这个工具对于许多不熟悉SQL语言或者命令行的朋友还是很方便和友好的。利用它，可以方便地导入和导出CSV和JSON文件。

具体操作图例参见MySQL官方手册即可:[Table Data Export and Import Wizard](https://dev.mysql.com/doc/workbench/en/wb-admin-export-import-table.html)，这里不再赘述。

![MySQL workbench](https://upload-images.jianshu.io/upload_images/72299-04a0a46ccc92e2df.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# 总结
本文介绍了将不同格式（JSON, Text, XML, CSV）的文件导入MySQL数据库的一些详细手段，并进行了一些分析，目的在于帮助读者扫除一些导入的障碍，理清一些概念。之所以没有讨论导出，是因为导出是一个MySQL到外的操作，是以MySQL本身为转移的，只要参考MySQL本身的机理即可。

真正对于大量数据的导入导出，需要思考的问题会很多(比如说在导入时，如何考虑Sharding)，这需要另开一篇讨论了。

谢谢阅读，欢迎指正。

______
*作者: freenik ([Jianshu](https://www.jianshu.com/users/202618da286b/latest_articles)); VonRyan ([CSDN](https://blog.csdn.net/vonryan))*

*本文采用以下协议进行授权: [自由转载-非商用-非衍生-保持署名 | Creative Commons BY-NC-ND 3.0](https://creativecommons.org/licenses/by-nc-nd/3.0/deed.zh)，转载请标明作者出处，尊重原创。*
