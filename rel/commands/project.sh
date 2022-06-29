#!/bin/sh
            cd /lux
            echo  | sudo -S tar xfz lux.tar.gz
            sudo mv /lux/lux.tar.gz /lux/releases/0.1.0/
            sudo /lux/bin/lux stop
            sudo /lux/bin/lux migrate
            sudo /lux/bin/lux start
            