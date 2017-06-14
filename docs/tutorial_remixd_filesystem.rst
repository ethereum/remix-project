Accessing sytem files from Remix using Remixd
===================================================

.. _tutorial-remixd-filesystem:

Remixd is an npm module. His purpose is to share a folder from your local computer to the remix web application.

The code of Remixd can be checked out `here <https://github.com/ethereum/remixd>`_ .

Remixd can be globally installed using the following command: ``npm install -g remixd``.

Then ``remixd -S <absolute-path-to-the-shared-folder>`` will start Remixd and share the given folder.

The folder is shared using a websocket connection between ``Remix IDE`` and ``Remixd``.

Be sure the user executing Remix has read/write permission on the folder.

Remixd listen on the port 65520. Please be sure your system is secured enough (port 65520 neither opened nor forwarded), that is not mandatory for the use of this feature but that will increase security.

From ``Remix IDE``, you will need to activate the connection.

Click on the ``localhost connection`` icon:

.. image:: remixd_noconnection.png

A modal dialog will ask confirmation

.. image:: remixd_alert.png

Accepting this dialog will start a session. Once the connection is made, the status will update and the connection icon should shows up in green.

Hovering the icon will give more connection status information.

At this point if the connection is successful, the shared folder will be available in the file explorer.

.. image:: remixd_connectionok.png
