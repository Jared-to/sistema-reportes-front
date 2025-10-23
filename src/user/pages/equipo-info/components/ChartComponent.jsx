import { useEffect, useRef, useState } from "react";
import { Download, MoreVert, TableChart } from "@mui/icons-material";
import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Tooltip } from "@mui/material";
import * as echarts from "echarts";

import { exportToCSV } from "../utils/ExportCSV";

// Utilidad para exportar a Excel (usando CSV como alternativa simple)
const exportToExcel = (data, filename) => {
  exportToCSV(data, filename); // Por simplicidad, usamos CSV
};

export const ChartComponent = ({
  title,
  data,
  xAxisData,
  yAxisName,
  seriesNames,
  colors,
  exportData,
  exportFilename
}) => {
  const chartRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const chartInstance = echarts.init(chartRef.current, 'dark');

    const seriesData = seriesNames.map((name, index) => ({
      name,
      type: 'line',
      data: data[index],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 2
      },
      color: colors ? colors[index] : undefined
    }));

    const option = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: seriesNames,
        bottom: 10,
        textStyle: {
          color: '#fff'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameTextStyle: {
          color: '#fff'
        },
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      },
      series: seriesData
    };

    chartInstance.setOption(option);

    return () => {
      chartInstance.dispose();
    };
  }, [data, xAxisData, title, yAxisName, seriesNames, colors]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportCSV = () => {
    if (exportData && exportData.length > 0) {
      exportToCSV(exportData, exportFilename || title);
    }
    handleMenuClose();
  };

  const handleExportExcel = () => {
    if (exportData && exportData.length > 0) {
      exportToExcel(exportData, exportFilename || title);
    }
    handleMenuClose();
  };

  return (
    <Paper sx={{ height: '400px', bgcolor: 'transparent', position: 'relative' }}>
      {/* Botón de exportación */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
        <Tooltip title="Opciones de exportación">
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
              }
            }}
          >
            <MoreVert />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: '#1e1e1e',
              color: 'white',
            }
          }}
        >
          <MenuItem onClick={handleExportCSV} disabled={!exportData || exportData.length === 0}>
            <ListItemIcon>
              <TableChart fontSize="small" sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText>Exportar a CSV</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleExportExcel} disabled={!exportData || exportData.length === 0}>
            <ListItemIcon>
              <Download fontSize="small" sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText>Exportar a Excel</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </Paper>
  );
};