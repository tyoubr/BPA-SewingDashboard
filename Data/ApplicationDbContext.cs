using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SewingDashboard.Models;


namespace SewingDashboard.Data
{
    public partial class ApplicationDbContext: DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public virtual DbSet<TblOperatorDetail> TblOperatorDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TblOperatorDetail>(entity =>
            {
                entity.HasKey(e => e.Oid);

                entity.ToTable("TBL_OPERATOR_DETAIL");

                entity.Property(e => e.Oid).HasColumnName("OID");
                entity.Property(e => e.AvgCycle)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("AVG_CYCLE");
                entity.Property(e => e.CapacityHr)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("CAPACITY_HR");
                entity.Property(e => e.Name)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("NAME");
                entity.Property(e => e.ProcessName)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("PROCESS_NAME");
                entity.Property(e => e.Remark)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("REMARK");
                entity.Property(e => e.ProductionDate).HasColumnType("datetime").HasColumnName("PROD_DATE");
                entity.Property(e => e.LineNo).HasColumnName("LINE_NO");
            });

            OnModelCreatingPartial(modelBuilder);
        }
        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);

    }
}
