//Background JS code
var Delaunay;

(function () {
  "use strict";

  var EPSILON = 1.0 / 1048576.0;

  function supertriangle(vertices) {
    var xmin = Number.POSITIVE_INFINITY,
      ymin = Number.POSITIVE_INFINITY,
      xmax = Number.NEGATIVE_INFINITY,
      ymax = Number.NEGATIVE_INFINITY,
      i,
      dx,
      dy,
      dmax,
      xmid,
      ymid;

    for (i = vertices.length; i--; ) {
      if (vertices[i][0] < xmin) xmin = vertices[i][0];
      if (vertices[i][0] > xmax) xmax = vertices[i][0];
      if (vertices[i][1] < ymin) ymin = vertices[i][1];
      if (vertices[i][1] > ymax) ymax = vertices[i][1];
    }

    dx = xmax - xmin;
    dy = ymax - ymin;
    dmax = Math.max(dx, dy);
    xmid = xmin + dx * 0.5;
    ymid = ymin + dy * 0.5;

    return [
      [xmid - 20 * dmax, ymid - dmax],
      [xmid, ymid + 20 * dmax],
      [xmid + 20 * dmax, ymid - dmax]
    ];
  }

  function circumcircle(vertices, i, j, k) {
    var x1 = vertices[i][0],
      y1 = vertices[i][1],
      x2 = vertices[j][0],
      y2 = vertices[j][1],
      x3 = vertices[k][0],
      y3 = vertices[k][1],
      fabsy1y2 = Math.abs(y1 - y2),
      fabsy2y3 = Math.abs(y2 - y3),
      xc,
      yc,
      m1,
      m2,
      mx1,
      mx2,
      my1,
      my2,
      dx,
      dy;

    /* Check for coincident points */
    if (fabsy1y2 < EPSILON && fabsy2y3 < EPSILON)
      throw new Error("Eek! Coincident points!");

    if (fabsy1y2 < EPSILON) {
      m2 = -((x3 - x2) / (y3 - y2));
      mx2 = (x2 + x3) / 2.0;
      my2 = (y2 + y3) / 2.0;
      xc = (x2 + x1) / 2.0;
      yc = m2 * (xc - mx2) + my2;
    } else if (fabsy2y3 < EPSILON) {
      m1 = -((x2 - x1) / (y2 - y1));
      mx1 = (x1 + x2) / 2.0;
      my1 = (y1 + y2) / 2.0;
      xc = (x3 + x2) / 2.0;
      yc = m1 * (xc - mx1) + my1;
    } else {
      m1 = -((x2 - x1) / (y2 - y1));
      m2 = -((x3 - x2) / (y3 - y2));
      mx1 = (x1 + x2) / 2.0;
      mx2 = (x2 + x3) / 2.0;
      my1 = (y1 + y2) / 2.0;
      my2 = (y2 + y3) / 2.0;
      xc = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
      yc = fabsy1y2 > fabsy2y3 ? m1 * (xc - mx1) + my1 : m2 * (xc - mx2) + my2;
    }

    dx = x2 - xc;
    dy = y2 - yc;
    return { i: i, j: j, k: k, x: xc, y: yc, r: dx * dx + dy * dy };
  }

  function dedup(edges) {
    var i, j, a, b, m, n;

    for (j = edges.length; j; ) {
      b = edges[--j];
      a = edges[--j];

      for (i = j; i; ) {
        n = edges[--i];
        m = edges[--i];

        if ((a === m && b === n) || (a === n && b === m)) {
          edges.splice(j, 2);
          edges.splice(i, 2);
          break;
        }
      }
    }
  }

  Delaunay = {
    triangulate: function (vertices, key) {
      var n = vertices.length,
        i,
        j,
        indices,
        st,
        open,
        closed,
        edges,
        dx,
        dy,
        a,
        b,
        c;

      /* Bail if there aren't enough vertices to form any triangles. */
      if (n < 3) return [];

      /* Slice out the actual vertices from the passed objects. (Duplicate the
       * array even if we don't, though, since we need to make a supertriangle
       * later on!) */
      vertices = vertices.slice(0);

      if (key) for (i = n; i--; ) vertices[i] = vertices[i][key];

      /* Make an array of indices into the vertex array, sorted by the
       * vertices' x-position. */
      indices = new Array(n);

      for (i = n; i--; ) indices[i] = i;

      indices.sort(function (i, j) {
        return vertices[j][0] - vertices[i][0];
      });

      /* Next, find the vertices of the supertriangle (which contains all other
       * triangles), and append them onto the end of a (copy of) the vertex
       * array. */
      st = supertriangle(vertices);
      vertices.push(st[0], st[1], st[2]);

      /* Initialize the open list (containing the supertriangle and nothing
       * else) and the closed list (which is empty since we havn't processed
       * any triangles yet). */
      open = [circumcircle(vertices, n + 0, n + 1, n + 2)];
      closed = [];
      edges = [];

      /* Incrementally add each vertex to the mesh. */
      for (i = indices.length; i--; edges.length = 0) {
        c = indices[i];

        /* For each open triangle, check to see if the current point is
         * inside it's circumcircle. If it is, remove the triangle and add
         * it's edges to an edge list. */
        for (j = open.length; j--; ) {
          /* If this point is to the right of this triangle's circumcircle,
           * then this triangle should never get checked again. Remove it
           * from the open list, add it to the closed list, and skip. */
          dx = vertices[c][0] - open[j].x;
          if (dx > 0.0 && dx * dx > open[j].r) {
            closed.push(open[j]);
            open.splice(j, 1);
            continue;
          }

          /* If we're outside the circumcircle, skip this triangle. */
          dy = vertices[c][1] - open[j].y;
          if (dx * dx + dy * dy - open[j].r > EPSILON) continue;

          /* Remove the triangle and add it's edges to the edge list. */
          edges.push(
            open[j].i,
            open[j].j,
            open[j].j,
            open[j].k,
            open[j].k,
            open[j].i
          );
          open.splice(j, 1);
        }

        /* Remove any doubled edges. */
        dedup(edges);

        /* Add a new triangle for each edge. */
        for (j = edges.length; j; ) {
          b = edges[--j];
          a = edges[--j];
          open.push(circumcircle(vertices, a, b, c));
        }
      }

      /* Copy any remaining open triangles to the closed list, and then
       * remove any triangles that share a vertex with the supertriangle,
       * building a list of triplets that represent triangles. */
      for (i = open.length; i--; ) closed.push(open[i]);
      open.length = 0;

      for (i = closed.length; i--; )
        if (closed[i].i < n && closed[i].j < n && closed[i].k < n)
          open.push(closed[i].i, closed[i].j, closed[i].k);

      /* Yay, we're done! */
      return open;
    },
    contains: function (tri, p) {
      /* Bounding box test first, for quick rejections. */
      if (
        (p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) ||
        (p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) ||
        (p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) ||
        (p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1])
      )
        return null;

      var a = tri[1][0] - tri[0][0],
        b = tri[2][0] - tri[0][0],
        c = tri[1][1] - tri[0][1],
        d = tri[2][1] - tri[0][1],
        i = a * d - b * c;

      /* Degenerate tri. */
      if (i === 0.0) return null;

      var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i,
        v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i;

      /* If we're outside the tri, fail. */
      if (u < 0.0 || v < 0.0 || u + v > 1.0) return null;

      return [u, v];
    }
  };

  if (typeof module !== "undefined") module.exports = Delaunay;
})();
var Sketch = {
  rezizeTimer: null,
  init: function () {
    var me = this;
    this.canvas = document.getElementById("c");
    this.setViewport();
    window.onresize = function () {
      clearTimeout(me.rezizeTimer);
      me.rezizeTimer = setTimeout(function () {
        me.setViewport.call(me);
        me.createVertices.call(me);
        me.render.call(me);
      }, 200);
    };
    this.createVertices();
    this.render();
  },
  createVertices: function () {
    var i, x, y, gradient;
    this.vertices = new Array(
      ~~((window.innerHeight / window.innerWidth) * 64)
    );
    for (i = this.vertices.length; i--; ) {
      do {
        x = Math.random() - 0.5;
        y = Math.random() - 0.5;
        gradient = {
          color:
            Math.random() - 0.5 > 0
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)"
        };
      } while (x * x + y * y > 0.25);

      x = (x * 2.96875 + 0.5) * this.canvas.width;
      y = (y * 2.96875 + 0.5) * this.canvas.height;

      this.vertices[i] = [x, y, gradient];
    }
  },
  render: function () {
    var ctx = this.canvas.getContext("2d");

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    var triangles = Delaunay.triangulate(this.vertices);

    for (i = triangles.length; i; ) {
      ctx.beginPath();
      var x1 = this.vertices[triangles[--i]][0],
        y1 = this.vertices[triangles[i]][1],
        x2 = this.vertices[triangles[--i]][0],
        y2 = this.vertices[triangles[i]][1],
        x3 = this.vertices[triangles[--i]][0],
        y3 = this.vertices[triangles[i]][1];

      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);

      var grd = ctx.createLinearGradient(x1, y1, x2, y3);
      // light blue
      grd.addColorStop(0, this.vertices[triangles[i]][2].color);
      // dark blue
      grd.addColorStop(1, "transparent");
      ctx.closePath();
      ctx.fillStyle = grd;
      ctx.fill();
      //ctx.stroke();
    }
  },
  setViewport: function () {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
};

Sketch.init();

/////////////////


function printFileName() {
  var a = document.getElementById("fileName").value;
  var filename = a.replace(/^.*\\/, "");
  document.getElementById("result").innerHTML = filename;
}


//File Handling JS code------------------------------

const MAX_FILE_SIZE = 1000000;

const API_ENDPOINT =
  "https://5fa2mohwi0.execute-api.us-east-1.amazonaws.com/default/getPresignedURL";

new Vue({
  el: "#app",
  data: {
    file: "",
    uploadURL: ""
  },
  methods: {
    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.createFile(files[0]);
    },
    createFile(file) {
      // var file = new File()
      let reader = new FileReader();
      reader.onload = (e) => {
        if (e.target.result.length > MAX_FILE_SIZE) {
          return alert("File is loo large.");
        }
        this.file = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    removeFile: function (e) {
      console.log("Remove clicked");
      this.file = "";
    },
    uploadFile: async function (e) {
      console.log("Upload clicked");
      // Get the presigned URL
      const response = await axios({
        method: "GET",
        url: API_ENDPOINT
      });
      ////////////////////////////////////////////////////
      var _validFileExtensions = [".log", ".zip", ".tar", ".txt"];
      function Validate(oForm) {
        var arrInputs = oForm.getElementsByTagName("input");
        for (var i = 0; i < arrInputs.length; i++) {
          var oInput = arrInputs[i];
          if (oInput.type == "file") {
            var sFileName = oInput.value;
            if (sFileName.length > 0) {
              var blnValid = false;
              for (var j = 0; j < _validFileExtensions.length; j++) {
                var sCurExtension = _validFileExtensions[j];
                if (
                  sFileName
                    .substr(
                      sFileName.length - sCurExtension.length,
                      sCurExtension.length
                    )
                    .toLowerCase() == sCurExtension.toLowerCase()
                ) {
                  blnValid = true;
                  break;
                }
              }

              if (!blnValid) {
                alert(
                  "Sorry, " +
                    sFileName +
                    " is invalid, allowed extensions are: " +
                    _validFileExtensions.join(", ")
                );
                return false;
              }
            }
          }
        }

        return true;
      }
      ///////////////////////////////////////////////////////////////////////////////

      console.log("Response: ", response);
      console.log("Uploading: ", this.file);
      let binary = atob(this.file.split(",")[1]);
      let array = [];
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      let blobData = new Blob([new Uint8Array(array)]);
      //   let blobData = new Blob([new Uint8Array(array)], {
      //     type: "application/zip"
      //   });
      console.log("Uploading to: ", response.uploadURL);
      const result = await fetch(response.uploadURL, {
        method: "PUT",
        body: blobData
      });
      console.log("Result: ", result);
      // Final URL for the user doesn't need the query string params
      this.uploadURL = response.uploadURL.split("?")[0];
    }
  }
});