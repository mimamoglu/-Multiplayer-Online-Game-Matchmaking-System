# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
import uuid


class Blacklist(models.Model):
    blacklistid = models.CharField(primary_key=True, max_length=10)
    playerid = models.ForeignKey(
        "Player", models.DO_NOTHING, db_column="playerid", blank=True, null=True
    )
    reportcount = models.IntegerField(blank=True, null=True)
    lastreportdate = models.DateTimeField(blank=True, null=True)
    suspiciousactivityscore = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "blacklist"


class Gamemode(models.Model):
    gamemodelid = models.CharField(primary_key=True, max_length=10)
    modename = models.CharField(max_length=50)
    maxplayers = models.IntegerField()

    class Meta:
        managed = False
        db_table = "gamemode"


class Gamesession(models.Model):
    gamesessionid = models.CharField(primary_key=True, max_length=30)
    starttime = models.DateTimeField(blank=True, null=True)
    endtime = models.DateTimeField(blank=True, null=True)
    gamemodelid = models.ForeignKey(
        Gamemode, models.DO_NOTHING, db_column="gamemodelid", blank=True, null=True
    )
    regionid = models.ForeignKey(
        "Region", models.DO_NOTHING, db_column="regionid", blank=True, null=True
    )
    sessionstatus = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "gamesession"


class Matchmakingqueue(models.Model):
    queueid = models.CharField(primary_key=True, max_length=32)
    playerid = models.ForeignKey(
        "Player", models.DO_NOTHING, db_column="playerid", blank=True, null=True
    )
    preferredgamemodelid = models.ForeignKey(
        Gamemode,
        models.DO_NOTHING,
        db_column="preferredgamemodelid",
        blank=True,
        null=True,
    )
    jointime = models.DateTimeField()
    status = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "matchmakingqueue"


class Player(models.Model):
    playerid = models.CharField(primary_key=True, max_length=30)
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=255)
    skillrating = models.IntegerField(default=0)
    gamesplayed = models.IntegerField(default=0)
    winrate = models.FloatField(default=0)
    serverip = models.ForeignKey(
        "Server", models.DO_NOTHING, db_column="serverip", blank=True, null=True
    )

    class Meta:
        managed = False
        db_table = "player"


class Ranking(models.Model):
    rankingid = models.CharField(primary_key=True, max_length=10)
    playerid = models.ForeignKey(
        Player, models.DO_NOTHING, db_column="playerid", blank=True, null=True
    )
    ranklevel = models.CharField(max_length=50, blank=True, null=True)
    wincount = models.IntegerField(blank=True, null=True)
    losecount = models.IntegerField(blank=True, null=True)
    points = models.IntegerField(blank=True, null=True)
    lastupdated = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "ranking"


class Region(models.Model):
    regionid = models.CharField(primary_key=True, max_length=10)
    regionname = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = "region"


class Server(models.Model):
    serverip = models.CharField(primary_key=True, max_length=15)
    status = models.CharField(max_length=50, blank=True, null=True)
    regionid = models.ForeignKey(
        Region, models.DO_NOTHING, db_column="regionid", blank=True, null=True
    )

    class Meta:
        managed = False
        db_table = "server"


class Sessionparticipant(models.Model):
    sessionid = models.ForeignKey(Gamesession, models.DO_NOTHING, db_column="sessionid")
    playerid = models.ForeignKey(
        Player, models.DO_NOTHING, db_column="playerid", blank=True, null=True
    )
    matchid = models.CharField(primary_key=True, max_length=255)

    class Meta:
        managed = False
        db_table = "sessionparticipant"