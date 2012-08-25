polyhedron
==========

...is intended to be an open-source, project-based, multi-user, geo-data management, analysis and visualization tool.

At the moment there is just a rough idea about how it should look and feel, but feel free to contact me, if you've got any ideas. 
We are also looking for interested programmers with GIS background as well as interface designers.


Structure
---------

We think of polyhedron as a server, that manages users and project accounts, and gives the user the ability to manage the geodata that are stored in a PostGIS DB.

The server also handles the backends, which allow the user to analyze and visualize the content and metadata in the DB.
For the statistical part of the backend, R seems to be a good choice. For the first prototype, it can also serve as the visualization backend through gnuplot.




