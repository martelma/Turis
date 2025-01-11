USE [MiBox]
GO

/*
//solo la prima volta per storicizzare il vecchio valore del DrawKey
UPDATE DrawingRevisions
   SET DrawKeyOld = DrawKey
*/

-- Crea la tabella temporanea
CREATE TABLE #TempTable (
	id uniqueidentifier,
	DrawKeyNew varchar(50)
);

;WITH cte as 
(
	SELECT [Id]
		  ,[DrawCode]
		  ,[DrawKey]
		  ,[RevisionLetter]
		  ,[RevisionDate]
		  ,[DrawingArchiveId]

		  , (SELECT SUBSTRING(
				[DrawKey],
				CHARINDEX('|', [DrawKey]) + 1,
				CHARINDEX('|', [DrawKey], CHARINDEX('|', [DrawKey]) + 1) - CHARINDEX('|', [DrawKey]) - 1
				)
			) AS PdfDocumentId

	  FROM DrawingRevisions
)
--select * from cte
, cteTavolaId as
(
SELECT *
	  , (
		SELECT distinct tavola.DocumentID
		  FROM [TGRP-SRVPRJ23].[Progetti].[dbo].[Documents] tavola
			INNER JOIN [TGRP-SRVPRJ23].[Progetti].[dbo].[XRefs] ref
				ON tavola.DocumentID = ref.XRefDocument
		 WHERE ref.DocumentID = PdfDocumentId
		   AND tavola.ExtensionID = 3
		   AND tavola.Deleted = 0
		   AND tavola.Shared = 1
		) as TavolaId
  FROM cte
)
, cteDrawKeyNew as
(
	SELECT *
		  , REPLACE(DrawKey, PdfDocumentId, TavolaId) as DrawKeyNew
	  FROM cteTavolaId
)
/*
SELECT *
	 , cte.DrawKeyNew
  FROM DrawingRevisions tab
		JOIN cteDrawKeyNew as cte 
			ON tab.id = cte.id
*/

INSERT INTO #TempTable (id, DrawKeyNew)
SELECT id, DrawKeyNew
  FROM cteDrawKeyNew

UPDATE DrawingRevisions
SET DrawKeyNew = temp.DrawKeyNew
FROM DrawingRevisions AS t
	JOIN #TempTable AS temp 
		ON t.id = temp.id;

-- Elimina la tabella temporanea
DROP TABLE #TempTable;

DELETE DrawingRevisions
 WHERE DrawKeyNew IS NULL

UPDATE DrawingRevisions
   SET DrawKey = DrawKeyNew

