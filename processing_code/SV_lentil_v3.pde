float x1, x2, xMid, y, cx1, cx2;
Location from, to;
ArrayList<Connection> connections;
long total;
long[] maxindexes;
long[] chromStarts;
int targetChrom = 1;


void setup() {
  size(2000, 1000);
  connections = new ArrayList<Connection>();
  //String[] lines = loadStrings("Eston-BNDtest.vcf");
  String[] lines = loadStrings("BM4-BNDtest.vcf");
  
  String line;
  int chrom1, chrom2;
  long location1, location2;
  String parts[];
  String subparts[];
  int maxchrom = 0;
  
  // First pass to find the number of chromosomes
  for (int i = 0; i < lines.length; i++) {
    line = lines[i];
    parts = line.split("\t");
    subparts = split(parts[0], ".");
    chrom1 = int(subparts[2].substring(3)); // chromosome of 'from' end of the link
    if (chrom1 > maxchrom) maxchrom = chrom1; // track the number of chromosomes
    subparts = splitTokens(parts[4], ":.][");
    chrom2 = int(subparts[2].substring(3)); // chromosome of the 'to' end of the link
    if (chrom2 > maxchrom) maxchrom = chrom2; // track the number of chromosomes
  }
  
  maxindexes = new long[maxchrom+1]; // largest index of each chromosome (todo: get these numbers from some gff)

  // Second pass to get connection locations and max indexes for each chromosome
  for (int i = 0; i < lines.length; i++) {
    line = lines[i];
    parts = line.split("\t");
    subparts = split(parts[0], ".");
    chrom1 = int(subparts[2].substring(3)); // chromosome of 'from' end of the link
    location1 = int(parts[1]); // index of the 'from' end of the link
    if (location1 > maxindexes[chrom1]) maxindexes[chrom1] = location1; // track the largest index for this chromosome

    subparts = splitTokens(parts[4], ":.");
    chrom2 = int(subparts[2].substring(3)); // chromosome of the 'to' end of the link
    subparts = splitTokens(subparts[3], "[]");
    location2 = int(subparts[0]); // index of the 'to' end of the link
    if (location2 > maxindexes[chrom2]) maxindexes[chrom2] = location2;  // track the largest index for this chromosome
    
    // Determine the type of the translocation
    // Forward-Forward: N[...[
    // Forward-Reverse: N]...]
    // Reverse-Reverse: ]...]N
    // Reverse-Forward: [...[N
    String[] matchResults = match(parts[4], "N\\[.*\\[");
    String type = "--";
    if (matchResults != null) {
      type = "FF";
    }
    matchResults = match(parts[4], "N\\].*\\]");
    if (matchResults != null) {
      type = "FR";
    }
    matchResults = match(parts[4], "\\].*\\]N");
    if (matchResults != null) {
      type = "RR";
    }
    matchResults = match(parts[4], "\\[.*\\[N");
    if (matchResults != null) {
      type = "RF";
    }
    connections.add(new Connection(new Location(chrom1, location1), new Location(chrom2, location2), type));
  }

  // Calculate the starting locations of each chromosome relative to the full genome
  chromStarts = new long[maxchrom+1];
  total = 0;
  for (int i = 0; i < maxchrom+1; i++) {
    chromStarts[i] = total;
    total += maxindexes[i];
  }
}

void draw() {
  background(200);
  // draw target chromosome at top of screen (todo: generalize to full zoom & pan)
  textSize(24);
  textAlign(CENTER, CENTER);
  fill(0);
  text("Chromosome " + targetChrom, width/2, 70);
  stroke(100);
  strokeWeight(14);
  line(100, 100, width-100, 100);

  // draw all chromosomes on bottom row (todo: generalize to full zoom & pan)
  float chromStartX, chromEndX;
  float chromY = 500;
  for (int i = 1; i < maxindexes.length; i++) {
    chromStartX = map(chromStarts[i], 0, total, 100, width-100);
    chromEndX = map(chromStarts[i] + maxindexes[i], 0, total, 100, width-100);

    line(chromStartX, chromY, chromEndX, chromY);
    line(chromEndX, chromY-20, chromEndX, chromY+20);
    text("Chromosome " + i, (chromStartX+chromEndX)/2, chromY+20);
    chromY += 20;
  }

  // draw connections
  strokeWeight(4);
  for (Connection conn : connections) {
    from = conn.from;
    to = conn.to;
    if (from.chrom == targetChrom) { // only draw connections from target chromosome
      x1 = map(from.index, 0, maxindexes[from.chrom], 100, width-100);
      x2 = map(chromStarts[to.chrom]+to.index, 0, total, 100, width-100);
      y = 500 + (to.chrom - 1) * 20;
      noFill();
      xMid = (x1+x2)/2;
      if (conn.type.equals("FF")) {
        stroke(200, 0, 0);
        if (xMid - x1 < 100) {
          cx1 = x1+200;
          cx2 = x2-200;
        } else {
          cx1 = xMid;
          cx2 = xMid;
        }
        bezier(x1, 100, cx1, 100, cx2, y, x2, y); // see https://processing.org/reference/bezier_.html
      }
      if (conn.type.equals("FR")) {
        stroke(220, 140, 0);
        //stroke(100, 0, 200);
        bezier(x1, 100, x1+200, 100, x2+200, y, x2, y);
      }
      if (conn.type.equals("RR")) {
        stroke(0, 200, 0);
        if (x1 - xMid < 100) {
          cx1 = x1-200;
          cx2 = x2+200;
        } else {
          cx1 = xMid;
          cx2 = xMid;
        }
        bezier(x1, 100, cx1, 100, cx2, y, x2, y);
      }
      if (conn.type.equals("RF")) {
        stroke(0, 0, 200);
        bezier(x1, 100, x1-200, 100, x2-200, y, x2, y);
      }
    }
  }
  
  // legend
  textSize(32);
  fill(200,0,0);
  text("Forward-Forward",200,600);
  fill(220, 140, 0);
  text("Forward-Reverse",200,650);
  fill(0,180,0);
  text("Reverse-Reverse",200,700);
  fill(0,0,200);
  text("Reverse-Forward",200,750);
  
}
