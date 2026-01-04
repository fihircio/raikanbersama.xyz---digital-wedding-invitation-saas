import { DataTypes, Model, Sequelize } from 'sequelize';

export class Invitation extends Model {
  public id!: string;
  public user_id!: string;
  public slug!: string;
  public template_id!: string;
  public event_type!: string;
  public bride_name!: string;
  public groom_name!: string;
  public host_names!: string;
  public event_date!: Date;
  public start_time!: string;
  public end_time!: string;
  public location_name!: string;
  public address!: string;
  public google_maps_url!: string;
  public waze_url!: string;
  public views!: number;
  public settings!: {
    music_url: string;
    primary_color: string;
    show_countdown: boolean;
    show_gallery: boolean;
    is_published: boolean;
    background_image?: string;
    pantun?: string;
    our_story?: string;
    hero_title?: string;
    greeting_text?: string;
    invitation_text?: string;
    story_title?: string;
    groom_color?: string;
    bride_color?: string;
    host_color?: string;
    date_color?: string;
    greeting_color?: string;
    greeting_size?: string;
    hero_color?: string;
    hero_size?: string;
    invitation_color?: string;
    invitation_size?: string;
  };
  public money_gift_details!: {
    enabled: boolean;
    bank_name: string;
    account_no: string;
    account_holder: string;
    qr_url: string;
  };
  public created_at!: Date;
  public updated_at!: Date;

  // Static method to initialize the model
  public static initialize(sequelize: Sequelize): typeof Invitation {
    Invitation.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        slug: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        template_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        event_type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        bride_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        groom_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        host_names: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        event_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        start_time: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        end_time: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        location_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        google_maps_url: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        waze_url: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        views: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        settings: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {
            music_url: '',
            primary_color: '#8B4513',
            show_countdown: true,
            show_gallery: true,
            is_published: false,
            background_image: '',
            pantun: '',
            our_story: '',
            hero_title: 'Raikan Cinta Kami',
            greeting_text: 'Assalammualaikum W.B.T',
            invitation_text: 'Dengan penuh kesyukuran ke hadrat Ilahi, kami menjemput anda ke majlis perkahwinan anakanda kami yang tercinta:',
            story_title: 'Kisah Cinta Kami',
            groom_color: '#8B4513',
            bride_color: '#8B4513',
            host_color: '#4B5563',
            date_color: '#1F2937',
            greeting_color: '#FFFFFF',
            greeting_size: '36',
            hero_color: '#FFFFFF',
            hero_size: '12',
            invitation_color: '#6B7280',
            invitation_size: '14'
          },
        },
        money_gift_details: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {
            enabled: false,
            bank_name: '',
            account_no: '',
            account_holder: '',
            qr_url: ''
          },
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'Invitation',
        tableName: 'invitations',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ['slug'],
          },
          {
            fields: ['user_id'],
          },
          {
            fields: ['event_date'],
          },
        ],
      }
    );

    return Invitation;
  }
}

export default Invitation;