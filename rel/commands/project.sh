#!/bin/sh
            cd /cac
            echo  | sudo -S tar xfz cac.tar.gz
            sudo mv /cac/cac.tar.gz /cac/releases/0.1.0/
            sudo /cac/bin/cac stop
            sudo /cac/bin/cac migrate
            sudo /cac/bin/cac start
            