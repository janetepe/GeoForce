﻿-- Nick's Revised Queries
DROP TABLE IF EXISTS sf_aggregated_gadm_disaster_counts;
SELECT  0 as countARC,
        ''::character varying as nameARC,
        0 as guidARC,
        null::geometry as geomarc,
        1 as count0,
        gadm0.name_0 as name0,
        gadm0.guid as guid0,
        gadm0.geom_simplify_med as geom0,
        1 as count1,
        gadm1.name_1 as name1, gadm1.guid as guid1,
        gadm1.geom_simplify_med as geom1,
        1 as count2,
        gadm2.name_2 as name2,
        gadm2.guid as guid2,
        gadm2.geom_simplify_med as geom2,
        1 as count3,
        gadm3.name_3 as name3,
        gadm3.guid as guid3,
        gadm3.geom_simplify_med as geom3,
        1 as count4,
        gadm4.name_4 as name4,
        gadm4.guid as guid4,
        gadm4.geom_simplify_med as geom4,
        1 as count5,
        gadm5.name_5 as name5,
        gadm5.guid as guid5,
        gadm5.geom_simplify_med as geom5,

                --Project Attributes
	sf_disaster.sector__c,
	sf_disaster.status__c,
	sf_disaster.stage_name__c,
	sf_disaster.start_date__c,
	sf_disaster.end_date__c,
	sf_disaster.sub_sector__c,
	sf_disaster.name,
	sf_disaster.summary__c,
	sf_disaster.total_budget__c,
	sf_disaster.sf_id

	
--INTO    sf_aggregated_gadm_disaster_counts
FROM    gadm0, gadm1, gadm2, gadm3, gadm4, gadm5, sf_disaster

WHERE   gadm0.id_0 = gadm1.id_0
  AND   gadm2.id_0 = gadm1.id_0
  AND   gadm3.id_0 = gadm1.id_0
  AND   gadm4.id_0 = gadm1.id_0
  AND   gadm5.id_0 = gadm1.id_0
  AND   gadm1.id_1 = gadm2.id_1
  AND   gadm3.id_1 = gadm2.id_1
  AND   gadm4.id_1 = gadm2.id_1
  AND   gadm5.id_1 = gadm2.id_1
  AND   gadm2.id_2 = gadm3.id_2
  AND   gadm4.id_2 = gadm3.id_2
  AND   gadm5.id_2 = gadm3.id_2
  AND   gadm3.id_3 = gadm4.id_3
  AND   gadm5.id_3 = gadm4.id_3
  AND   gadm4.id_4 = gadm5.id_4
  AND   gadm5.guid::text = sf_disaster.location__r_gis_geo_id__c
  AND sf_disaster.location__r_type__c = 'Admin 5';



INSERT INTO sf_aggregated_gadm_disaster_counts
  ( SELECT  0 as countARC,
            ''::character varying as nameARC,
            0 as guidARC,
            null::geometry as geomarc,
            1 as count0,
            gadm0.name_0 as name0,
            gadm0.guid as guid0,
            gadm0.geom_simplify_med as geom0,
            1 as count1,
            gadm1.name_1 as name1, gadm1.guid as guid1,
            gadm1.geom_simplify_med as geom1,
            1 as count2,
            gadm2.name_2 as name2,
            gadm2.guid as guid2,
            gadm2.geom_simplify_med as geom2,
            1 as count3,
            gadm3.name_3 as name3,
            gadm3.guid as guid3,
            gadm3.geom_simplify_med as geom3,
            1 as count4,
            gadm4.name_4 as name4,
            gadm4.guid as guid4,
            gadm4.geom_simplify_med as geom4,
            0 as count5,
            '' as name5,
            null as guid5,
            null::geometry as geom5,

        --Project Attributes
	sf_disaster.sector__c,
	sf_disaster.status__c,
	sf_disaster.stage_name__c,
	sf_disaster.start_date__c,
	sf_disaster.end_date__c,
	sf_disaster.sub_sector__c,
	sf_disaster.name,
	sf_disaster.summary__c,
	sf_disaster.total_budget__c,
	sf_disaster.sf_id
	
    FROM    gadm0, gadm1, gadm2, gadm3, gadm4, sf_disaster
    WHERE   gadm0.id_0 = gadm1.id_0
      AND   gadm2.id_0 = gadm1.id_0
      AND   gadm3.id_0 = gadm1.id_0
      AND   gadm4.id_0 = gadm1.id_0
      AND   gadm1.id_1 = gadm2.id_1
      AND   gadm3.id_1 = gadm2.id_1
      AND   gadm4.id_1 = gadm2.id_1
      AND   gadm2.id_2 = gadm3.id_2
      AND   gadm4.id_2 = gadm3.id_2
      AND   gadm3.id_3 = gadm4.id_3
      AND   gadm4.guid::text = sf_disaster.location__r_gis_geo_id__c
      AND sf_disaster.location__r_type__c = 'Admin 4'
      );


INSERT INTO sf_aggregated_gadm_disaster_counts
  ( SELECT  0 as countARC,
            ''::character varying as nameARC,
            0 as guidARC,
            null::geometry as geomarc,
            1 as count0,
            gadm0.name_0 as name0,
            gadm0.guid as guid0,
            gadm0.geom_simplify_med as geom0,
            1 as count1,
            gadm1.name_1 as name1, gadm1.guid as guid1,
            gadm1.geom_simplify_med as geom1,
            1 as count2,
            gadm2.name_2 as name2,
            gadm2.guid as guid2,
            gadm2.geom_simplify_med as geom2,
            1 as count3,
            gadm3.name_3 as name3,
            gadm3.guid as guid3,
            gadm3.geom_simplify_med as geom3,
            0 as count4,
            '' as name4,
            null as guid4,
            null::geometry as geom4,
            0 as count5,
            '' as name5,
            null as guid5,
            null::geometry as geom5,

                   --Project Attributes
	sf_disaster.sector__c,
	sf_disaster.status__c,
	sf_disaster.stage_name__c,
	sf_disaster.start_date__c,
	sf_disaster.end_date__c,
	sf_disaster.sub_sector__c,
	sf_disaster.name,
	sf_disaster.summary__c,
	sf_disaster.total_budget__c,
	sf_disaster.sf_id
            
    FROM    gadm0, gadm1, gadm2, gadm3, sf_disaster
    WHERE   gadm0.id_0 = gadm1.id_0
      AND   gadm2.id_0 = gadm1.id_0
      AND   gadm3.id_0 = gadm1.id_0
      AND   gadm1.id_1 = gadm2.id_1
      AND   gadm3.id_1 = gadm2.id_1
      AND   gadm2.id_2 = gadm3.id_2
      AND   gadm3.guid::text = sf_disaster.location__r_gis_geo_id__c
      AND sf_disaster.location__r_type__c = 'Admin 3'
      );


INSERT INTO sf_aggregated_gadm_disaster_counts
  ( SELECT 0 as countARC,
          ''::character varying as nameARC,
          0 as guidARC,
          null::geometry as geomarc,
          1 as count0,
          gadm0.name_0 as name,
          gadm0.guid,
          gadm0.geom_simplify_med as geom0,
          1 as count1,
          gadm1.name_1 as name,
          gadm1.guid,
          gadm1.geom_simplify_med as geom1,
          1 as count2,
          gadm2.name_2 as name2,
          gadm2.guid as guid2,
          gadm2.geom_simplify_med as geom2,
          0 as count3,
          '' as name3,
          null as guid3,
          null::geometry as geom3,
          0 as count4,
          '' as name4,
          null as guid4,
          null::geometry as geom4,
          0 as count5,
          '' as name5,
          null as guid5,
          null::geometry as geom5,
          
                    --Project Attributes
	sf_disaster.sector__c,
	sf_disaster.status__c,
	sf_disaster.stage_name__c,
	sf_disaster.start_date__c,
	sf_disaster.end_date__c,
	sf_disaster.sub_sector__c,
	sf_disaster.name,
	sf_disaster.summary__c,
	sf_disaster.total_budget__c,
	sf_disaster.sf_id
          
    FROM  gadm0, gadm1, gadm2, sf_disaster
    WHERE gadm0.id_0 = gadm1.id_0
      AND gadm1.id_1 = gadm2.id_1
      AND gadm2.id_0 = gadm1.id_0
      AND gadm2.guid::text = sf_disaster.location__r_gis_geo_id__c
      AND sf_disaster.location__r_type__c = 'Admin 2'
);

INSERT INTO sf_aggregated_gadm_disaster_counts
  ( SELECT 0 as countARC,
          ''::character varying as nameARC,
          0 as guidARC,
          null::geometry as geomarc,
          1 as count0,
          gadm0.name_0 as name,
          gadm0.guid,
          gadm0.geom_simplify_med as geom0,
          1 as count1,
          gadm1.name_1 as name,
          gadm1.guid,
          gadm1.geom_simplify_med as geom1,
          0 as count2,
          '' as name2,
          null as guid2,
          null::geometry as geom2,
          0 as count3,
          '' as name3,
          null as guid3,
          null::geometry as geom3,
          0 as count4,
          '' as name4,
          null as guid4,
          null::geometry as geom4,
          0 as count5,
          '' as name5,
          null as guid5,
          null::geometry as geom5,

                    --Project Attributes
	sf_disaster.sector__c,
	sf_disaster.status__c,
	sf_disaster.stage_name__c,
	sf_disaster.start_date__c,
	sf_disaster.end_date__c,
	sf_disaster.sub_sector__c,
	sf_disaster.name,
	sf_disaster.summary__c,
	sf_disaster.total_budget__c,
	sf_disaster.sf_id
	
    FROM  gadm1, gadm0, sf_disaster
    WHERE gadm0.id_0 = gadm1.id_0
      AND gadm1.guid::text = sf_disaster.location__r_gis_geo_id__c
      AND sf_disaster.location__r_type__c = 'Admin 1'
	);


INSERT INTO sf_aggregated_gadm_disaster_counts
  ( SELECT 0 as countARC,
          ''::character varying as nameARC,
          0 as guidARC,
          null::geometry as geomarc,
          1 as count0,
          gadm0.name_0 as name,
          gadm0.guid,
          gadm0.geom_simplify_med as geom0,
          0 as count1,
          '' as name1,
          null as guid1,
          null::geometry as geom1,
          0 as count2,
          '' as name2,
          null as guid2,
          null::geometry as geom2,
          0 as count3,
          '' as name3,
          null as guid3,
          null::geometry as geom3,
          0 as count4,
          '' as name4,
          null as guid4,
          null::geometry as geom4,
          0 as count5,
          '' as name5,
          null as guid5,
          null::geometry as geom5,

          --Project Attributes
	sf_disaster.sector__c,
	sf_disaster.status__c,
	sf_disaster.stage_name__c,
	sf_disaster.start_date__c,
	sf_disaster.end_date__c,
	sf_disaster.sub_sector__c,
	sf_disaster.name,
	sf_disaster.summary__c,
	sf_disaster.total_budget__c,
	sf_disaster.sf_id


	FROM gadm0, sf_disaster
	WHERE gadm0.guid::text = sf_disaster.location__r_gis_geo_id__c
	AND location__r_gis_geo_id__c IS NOT NULL
	AND sf_disaster.location__r_type__c = 'Admin 0'
	);


ALTER TABLE sf_aggregated_gadm_disaster_counts ADD COLUMN id SERIAL;


UPDATE sf_aggregated_gadm_disaster_counts SET id = DEFAULT;


ALTER TABLE sf_aggregated_gadm_disaster_counts ADD PRIMARY KEY (id);


CREATE INDEX idx_sf_disastercounts_id ON sf_aggregated_gadm_disaster_counts USING btree (id);


UPDATE sf_aggregated_gadm_disaster_counts SET geom0 = ST_BUFFER(geom0, 0);


UPDATE sf_aggregated_gadm_disaster_counts
SET nameARC = a.arcregion2, countarc = count0, guidarc = a.gid, geomarc = a.geom
FROM ARC_REGIONS_DISSOLVED a
WHERE ST_INTERSECTS(a.geom, geom0);


ALTER TABLE sf_aggregated_gadm_projects_counts ADD COLUMN id SERIAL;
UPDATE sf_aggregated_gadm_projects_counts SET id = DEFAULT;
ALTER TABLE sf_aggregated_gadm_projects_counts ADD PRIMARY KEY (id);
CREATE INDEX idx_sf_disastercounts_id ON sf_aggregated_gadm_projects_counts USING btree (id);
UPDATE sf_aggregated_gadm_projects_counts SET geom0 = ST_BUFFER(geom0, 0);

update sf_aggregated_gadm_projects_counts
set nameARC = a.arcregion2, countarc = count0, guidarc = a.gid, geomarc = a.geom
FROM ARC_REGIONS_DISSOLVED a
WHERE ST_INTERSECTS(a.geom, geom0);

select * from sf_aggregated_gadm_projects_counts;